import { FastifyReply, FastifyRequest } from "fastify";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getUserHasAccessToSitePublic } from "../../lib/auth-utils.js";
import { FilterParameter } from "./types.js";
import {
  getFilterStatement,
  getSqlParam,
  getTimeStatement,
  processResults,
} from "./utils.js";
import { FilterParams } from "@rybbit/shared";

interface GetSingleColRequest {
  Params: {
    site: string;
  };
  Querystring: FilterParams<{
    parameter: FilterParameter;
    limit?: number;
    page?: number;
  }>;
}

type GetSingleColResponse = {
  value: string;
  // title is only used for pathname
  title?: string;
  // count means sessions where this page was the entry/exit
  count: number;
  percentage: number;

  pageviews?: number; // pageviews of this specific page when it was an entry/exit
  pageviews_percentage?: number;
  time_on_page_seconds?: number; // avg time on this page when it was an entry/exit
}[];

// This type represents a single item in the array returned *within* the data property
type SingleColItem = {
  value: string;
  title?: string;
  pathname?: string;
  count: number;
  percentage: number;
  pageviews?: number;
  pageviews_percentage?: number;
  time_on_page_seconds?: number;
};

// This is the structure the API will now send
type GetSingleColPaginatedResponse = {
  data: SingleColItem[];
  totalCount: number;
};

const getQuery = (
  request: FastifyRequest<GetSingleColRequest>,
  isCountQuery: boolean = false
) => {
  const {
    startDate,
    endDate,
    timeZone,
    filters,
    parameter,
    limit,
    page,
    pastMinutesStart,
    pastMinutesEnd,
  } = request.query;

  const filterStatement = getFilterStatement(filters);
  const timeStatement = getTimeStatement(request.query);

  let validatedLimit: number | null = null;
  if (!isCountQuery && limit !== undefined) {
    const parsedLimit = parseInt(String(limit), 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      validatedLimit = parsedLimit;
    }
  }
  const limitStatement =
    !isCountQuery && validatedLimit
      ? `LIMIT ${validatedLimit}`
      : isCountQuery
        ? ""
        : "LIMIT 100";

  let validatedOffset: number | null = null;
  if (!isCountQuery && page !== undefined) {
    const parsedPage = parseInt(String(page), 10);
    if (!isNaN(parsedPage) && parsedPage >= 1) {
      const pageOffset = (parsedPage - 1) * (validatedLimit || 100);
      validatedOffset = pageOffset;
    }
  }
  const offsetStatement =
    !isCountQuery && validatedOffset ? `OFFSET ${validatedOffset}` : "";

  if (parameter === "event_name") {
    if (isCountQuery) {
      return `
      SELECT COUNT(DISTINCT event_name) as totalCount
      FROM events
      WHERE
        site_id = {siteId:Int32}
        AND event_name IS NOT NULL 
        AND event_name <> ''
        ${filterStatement}
        ${timeStatement}
        AND type = 'custom_event';
      `;
    }
    return `
    SELECT
      event_name as value,
      COUNT(*) as count,
      ROUND(COUNT(distinct(session_id)) * 100.0 / SUM(COUNT(distinct(session_id))) OVER (), 2) as percentage
    FROM events
    WHERE
      site_id = {siteId:Int32}
      AND event_name IS NOT NULL 
      AND event_name <> ''
      ${filterStatement}
      ${timeStatement}
      AND type = 'custom_event'
    GROUP BY event_name ORDER BY count desc
    ${limitStatement}
    ${offsetStatement};
  `;
  }

  if (parameter === "page_title") {
    const corePageTitleLogic = `
      SELECT
          page_title as value,
          argMax(pathname, timestamp) as pathname,
          COUNT(DISTINCT session_id) as unique_sessions
      FROM events
      WHERE
          site_id = {siteId:Int32}
          AND page_title IS NOT NULL 
          AND page_title <> ''
          AND type = 'pageview'
          ${filterStatement}
          ${timeStatement}
      GROUP BY page_title
    `;

    if (isCountQuery) {
      return `SELECT COUNT(*) as totalCount FROM (${corePageTitleLogic});`;
    }

    return `
      WITH TitleStats AS (
        ${corePageTitleLogic}
      )
      SELECT
          value,       -- This is page_title
          pathname,    -- This is the representative pathname
          unique_sessions as count,
          ROUND(
              unique_sessions * 100.0 / SUM(unique_sessions) OVER (), 
              2
          ) as percentage
      FROM TitleStats
      ORDER BY count DESC
      ${limitStatement}
      ${offsetStatement};
    `;
  }

  if (parameter === "exit_page" || parameter === "entry_page") {
    const isEntry = parameter === "entry_page";
    const orderDirection = isEntry ? "ASC" : "DESC";
    const rowNumFilter = isEntry ? "row_num = 1" : "row_num = 1";

    const baseCteQuery = `
      RelevantEvents AS (
          SELECT *
          FROM events
          WHERE
              site_id = {siteId:Int32}
              AND type = 'pageview'
              ${filterStatement}
              ${timeStatement}
      ),
      EventTimes AS (
          SELECT
              session_id,
              pathname,
              timestamp,
              leadInFrame(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING) as next_timestamp,
              row_number() OVER (PARTITION BY session_id ORDER BY timestamp ${orderDirection}) as row_num
          FROM RelevantEvents
      ),
      PageDurations AS (
          SELECT
              session_id,
              pathname,
              timestamp,
              next_timestamp,
              row_num,
              if(isNull(next_timestamp), 0, dateDiff('second', timestamp, next_timestamp)) as time_diff_seconds
          FROM EventTimes
      ),
      FilteredDurations AS (
          SELECT *
          FROM PageDurations
          WHERE ${rowNumFilter}
      ),
      PathStats AS (
          SELECT
              pathname,
              count(DISTINCT session_id) as unique_sessions,
              count() as visits,
              avg(if(time_diff_seconds < 0, 0, if(time_diff_seconds > 1800, 1800, time_diff_seconds))) as avg_time_on_page_seconds
          FROM FilteredDurations
          WHERE pathname IS NOT NULL AND pathname <> ''
          GROUP BY pathname
      )
    `;

    if (isCountQuery) {
      return `
      WITH ${baseCteQuery}
      SELECT COUNT(DISTINCT pathname) as totalCount FROM PathStats;
      `;
    }

    return `
    WITH ${baseCteQuery}
    SELECT
        pathname as value, 
        unique_sessions as count,
        round((unique_sessions / sum(unique_sessions) OVER ()) * 100, 2) as percentage,
        visits as pageviews,
        round((visits / sum(visits) OVER ()) * 100, 2) as pageviews_percentage,
        avg_time_on_page_seconds as time_on_page_seconds
    FROM PathStats
    ORDER BY unique_sessions DESC
    ${limitStatement}
    ${offsetStatement};`;
  }

  if (parameter === "pathname") {
    const baseCteQuery = `
      EventTimes AS (
          SELECT
              session_id,
              pathname,
              timestamp,
              leadInFrame(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING) as next_timestamp
          FROM events
          WHERE 
            site_id = {siteId:Int32}
            AND type = 'pageview'
            ${filterStatement}
            ${timeStatement}
      ),
      PageDurations AS (
          SELECT
              session_id,
              pathname,
              timestamp,
              next_timestamp,
              if(isNull(next_timestamp), 0, dateDiff('second', timestamp, next_timestamp)) as time_diff_seconds
          FROM EventTimes
      ),
      PathStats AS (
          SELECT
              pathname,
              count() as visits,
              count(DISTINCT session_id) as unique_sessions,
              avg(if(time_diff_seconds < 0, 0, if(time_diff_seconds > 1800, 1800, time_diff_seconds))) as avg_time_on_page_seconds
          FROM PageDurations
          GROUP BY pathname
      )
    `;
    if (isCountQuery) {
      return `
      WITH ${baseCteQuery}
      SELECT COUNT(DISTINCT pathname) as totalCount FROM PathStats;
      `;
    }
    return `
    WITH ${baseCteQuery}
    SELECT
        pathname as value,
        unique_sessions as count,
        round((unique_sessions / sum(unique_sessions) OVER ()) * 100, 2) as percentage,
        visits as pageviews,
        round((visits / sum(visits) OVER ()) * 100, 2) as pageviews_percentage,
        avg_time_on_page_seconds as time_on_page_seconds
    FROM PathStats
    ORDER BY unique_sessions DESC
    ${limitStatement}
    ${offsetStatement};
    `;
  }

  // Default case for other parameters
  const sqlParam = getSqlParam(parameter);
  if (isCountQuery) {
    return `
    SELECT COUNT(DISTINCT ${sqlParam}) as totalCount
    FROM events
    WHERE
        site_id = {siteId:Int32}
        AND ${sqlParam} IS NOT NULL
        AND ${sqlParam} <> ''
        ${filterStatement}
        ${timeStatement};
    `;
  }

  return `
    WITH PageStats AS (
      SELECT
        ${sqlParam} as value,
        COUNT(distinct(session_id)) as unique_sessions,
        COUNT() as pageviews
      FROM events
      WHERE
          site_id = {siteId:Int32}
          AND ${sqlParam} IS NOT NULL
          AND ${sqlParam} <> ''
          ${filterStatement}
          ${timeStatement}
      GROUP BY value
    )
    SELECT
      value,
      unique_sessions as count,
      round((unique_sessions / sum(unique_sessions) OVER ()) * 100, 2) as percentage,
      pageviews,
      round((pageviews / sum(pageviews) OVER ()) * 100, 2) as pageviews_percentage
    FROM PageStats
    ORDER BY count desc
    ${limitStatement}
    ${offsetStatement};
  `;
};

export async function getSingleCol(
  req: FastifyRequest<GetSingleColRequest>,
  res: FastifyReply
) {
  const { parameter, page } = req.query;
  const site = req.params.site;

  const userHasAccessToSite = await getUserHasAccessToSitePublic(req, site);
  if (!userHasAccessToSite) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const isPaginatedRequest = page !== undefined;

  const dataQuery = getQuery(req, false);
  const countQuery = getQuery(req, true);

  try {
    // Run both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      clickhouse.query({
        query: dataQuery,
        format: "JSONEachRow",
        query_params: {
          siteId: Number(site),
        },
      }),
      clickhouse.query({
        query: countQuery,
        format: "JSONEachRow",
        query_params: {
          siteId: Number(site),
        },
      }),
    ]);

    const items = await processResults<SingleColItem>(dataResult);
    const countData = await processResults<{ totalCount: number }>(countResult);
    const totalCount = countData.length > 0 ? countData[0].totalCount : 0;

    return res.send({ data: { data: items, totalCount } });
  } catch (error) {
    console.error(`Error fetching ${parameter}:`, error);
    console.error("Failed dataQuery:", dataQuery);
    if (isPaginatedRequest) {
      console.error("Failed countQuery:", countQuery);
    }
    return res.status(500).send({ error: `Failed to fetch ${parameter}` });
  }
}
