import { FastifyReply, FastifyRequest } from "fastify";
import clickhouse from "../../db/clickhouse/clickhouse.js";
import { getUserHasAccessToSitePublic } from "../../lib/auth-utils.js";
import {
  getFilterStatement,
  getTimeStatement,
  processResults,
} from "./utils.js";
import { PerformanceByPathItem } from "./types.js";

interface GetPerformanceByPathRequest {
  Params: {
    site: string;
  };
  Querystring: {
    startDate: string;
    endDate: string;
    pastMinutesStart?: number;
    pastMinutesEnd?: number;
    timeZone: string;
    filters: string;
    limit?: number;
    page?: number;
  };
}

// This is the structure the API will now send
type GetPerformanceByPathPaginatedResponse = {
  data: PerformanceByPathItem[];
  totalCount: number;
};

const getQuery = (
  request: FastifyRequest<GetPerformanceByPathRequest>,
  isCountQuery: boolean = false
) => {
  const {
    startDate,
    endDate,
    timeZone,
    filters,
    limit,
    page,
    pastMinutesStart,
    pastMinutesEnd,
  } = request.query;

  const filterStatement = getFilterStatement(filters);

  // Handle specific past minutes range if provided
  const pastMinutesRange =
    pastMinutesStart && pastMinutesEnd
      ? { start: Number(pastMinutesStart), end: Number(pastMinutesEnd) }
      : undefined;

  const timeStatement = getTimeStatement(
    pastMinutesRange
      ? { pastMinutesRange }
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

  const baseCteQuery = `
    PerformanceStats AS (
        SELECT
            pathname,
            COUNT(*) as event_count,
            avg(lcp) as lcp_avg,
            quantile(0.5)(lcp) as lcp_p50,
            quantile(0.75)(lcp) as lcp_p75,
            quantile(0.9)(lcp) as lcp_p90,
            quantile(0.99)(lcp) as lcp_p99,
            avg(cls) as cls_avg,
            quantile(0.5)(cls) as cls_p50,
            quantile(0.75)(cls) as cls_p75,
            quantile(0.9)(cls) as cls_p90,
            quantile(0.99)(cls) as cls_p99,
            avg(inp) as inp_avg,
            quantile(0.5)(inp) as inp_p50,
            quantile(0.75)(inp) as inp_p75,
            quantile(0.9)(inp) as inp_p90,
            quantile(0.99)(inp) as inp_p99,
            avg(fcp) as fcp_avg,
            quantile(0.5)(fcp) as fcp_p50,
            quantile(0.75)(fcp) as fcp_p75,
            quantile(0.9)(fcp) as fcp_p90,
            quantile(0.99)(fcp) as fcp_p99,
            avg(ttfb) as ttfb_avg,
            quantile(0.5)(ttfb) as ttfb_p50,
            quantile(0.75)(ttfb) as ttfb_p75,
            quantile(0.9)(ttfb) as ttfb_p90,
            quantile(0.99)(ttfb) as ttfb_p99
        FROM events
        WHERE 
          site_id = {siteId:Int32}
          AND type = 'performance'
          AND pathname IS NOT NULL 
          AND pathname <> ''
          ${filterStatement}
          ${timeStatement}
        GROUP BY pathname
    )
  `;

  if (isCountQuery) {
    return `
    WITH ${baseCteQuery}
    SELECT COUNT(DISTINCT pathname) as totalCount FROM PerformanceStats;
    `;
  }

  return `
  WITH ${baseCteQuery}
  SELECT
      pathname,
      event_count,
      lcp_avg,
      lcp_p50,
      lcp_p75,
      lcp_p90,
      lcp_p99,
      cls_avg,
      cls_p50,
      cls_p75,
      cls_p90,
      cls_p99,
      inp_avg,
      inp_p50,
      inp_p75,
      inp_p90,
      inp_p99,
      fcp_avg,
      fcp_p50,
      fcp_p75,
      fcp_p90,
      fcp_p99,
      ttfb_avg,
      ttfb_p50,
      ttfb_p75,
      ttfb_p90,
      ttfb_p99
  FROM PerformanceStats
  ORDER BY event_count DESC
  ${limitStatement}
  ${offsetStatement};
  `;
};

export async function getPerformanceByPath(
  req: FastifyRequest<GetPerformanceByPathRequest>,
  res: FastifyReply
) {
  const { page } = req.query;
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

    const items = await processResults<PerformanceByPathItem>(dataResult);
    const countData = await processResults<{ totalCount: number }>(countResult);
    const totalCount = countData.length > 0 ? countData[0].totalCount : 0;

    return res.send({ data: { data: items, totalCount } });
  } catch (error) {
    console.error("Error fetching performance by path:", error);
    console.error("Failed dataQuery:", dataQuery);
    if (isPaginatedRequest) {
      console.error("Failed countQuery:", countQuery);
    }
    return res
      .status(500)
      .send({ error: "Failed to fetch performance by path" });
  }
}
