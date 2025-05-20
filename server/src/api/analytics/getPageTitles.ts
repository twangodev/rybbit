import { FastifyReply, FastifyRequest } from "fastify";
import clickhouse from "../../db/clickhouse/clickhouse.js";
import { getUserHasAccessToSitePublic } from "../../lib/auth-utils.js";
import {
  getFilterStatement,
  getTimeStatement,
  processResults,
} from "./utils.js";

interface GetPageTitlesRequest {
  Params: {
    site: string;
  };
  Querystring: {
    startDate: string;
    endDate: string;
    minutes: number;
    timeZone: string;
    filters: string;
    limit?: number;
    offset?: number;
  };
}

// Represents a single item in the response
type PageTitleItem = {
  value: string; // The page_title itself
  pathname: string; // A representative pathname for this title
  count: number; // Unique sessions or pageviews for this title
  percentage: number;
};

// Structure for paginated response (if/when fully paginated)
type PageTitlesPaginatedResponse = {
  data: PageTitleItem[];
  totalCount: number;
};

const getPageTitlesQuery = (
  request: FastifyRequest<GetPageTitlesRequest>,
  isCountQuery: boolean = false
) => {
  const { startDate, endDate, timeZone, filters, limit, offset, minutes } =
    request.query;

  const filterStatement = getFilterStatement(filters);
  const timeStatement = getTimeStatement(
    minutes
      ? { pastMinutes: Number(minutes) }
      : {
          date: { startDate, endDate, timeZone },
        }
  );

  let validatedLimit: number | null = null;
  if (!isCountQuery && limit !== undefined) {
    const parsedLimit = parseInt(String(limit), 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      validatedLimit = parsedLimit;
    }
  }
  // StandardSection usually shows a small number, e.g., 7 or 10. Let's default to 10 for non-paginated use.
  const limitStatement =
    !isCountQuery && validatedLimit
      ? `LIMIT ${validatedLimit}`
      : isCountQuery
        ? ""
        : "LIMIT 10";

  let validatedOffset: number | null = null;
  if (!isCountQuery && offset !== undefined) {
    const parsedOffset = parseInt(String(offset), 10);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      validatedOffset = parsedOffset;
    }
  }
  const offsetStatement =
    !isCountQuery && validatedOffset ? `OFFSET ${validatedOffset}` : "";

  // For page_title, we want to count distinct sessions that viewed this title.
  // We also need a representative pathname.
  // Using argMax to get the pathname from the most recent event for that title in a session.
  const coreLogic = `
    SELECT
        page_title as value,
        argMax(pathname, timestamp) as pathname, // Get pathname of latest event for this title in session
        COUNT(DISTINCT session_id) as unique_sessions
    FROM events
    WHERE
        site_id = {siteId:Int32}
        AND page_title IS NOT NULL
        AND page_title <> ''
        AND type = 'pageview' // Ensure these are pageview events
        ${filterStatement}
        ${timeStatement}
    GROUP BY page_title
  `;

  if (isCountQuery) {
    return `
      SELECT COUNT(*) as totalCount FROM (
        ${coreLogic}
      );
    `;
  }

  // For the data query, we calculate percentages after getting unique_sessions per title
  return `
    WITH TitleStats AS (
      ${coreLogic}
    )
    SELECT
        value,
        pathname,
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
};

export async function getPageTitles(
  req: FastifyRequest<GetPageTitlesRequest>,
  res: FastifyReply
) {
  const site = req.params.site;
  const { offset } = req.query;

  const userHasAccessToSite = await getUserHasAccessToSitePublic(req, site);
  if (!userHasAccessToSite) {
    return res.status(403).send({ error: "Forbidden" });
  }

  const isPaginatedRequest = offset !== undefined; // True if offset is present

  const dataQuery = getPageTitlesQuery(req, false);

  try {
    const dataResult = await clickhouse.query({
      query: dataQuery,
      format: "JSONEachRow",
      query_params: {
        siteId: Number(site),
      },
    });
    const items = await processResults<PageTitleItem>(dataResult);

    if (isPaginatedRequest) {
      const countQuery = getPageTitlesQuery(req, true);
      const countResult = await clickhouse.query({
        query: countQuery,
        format: "JSONEachRow",
        query_params: {
          siteId: Number(site),
        },
      });
      const countData = await processResults<{ totalCount: number }>(
        countResult
      );
      const totalCount = countData.length > 0 ? countData[0].totalCount : 0;
      return res.send({ data: { data: items, totalCount } });
    } else {
      // For non-paginated (StandardSection default) use, return the simpler structure
      return res.send({ data: items });
    }
  } catch (error) {
    console.error(`Error fetching page titles:`, error);
    console.error("Failed dataQuery:", dataQuery);
    if (isPaginatedRequest) {
      const countQuery = getPageTitlesQuery(req, true);
      console.error("Failed countQuery:", countQuery);
    }
    return res.status(500).send({ error: `Failed to fetch page titles` });
  }
}
