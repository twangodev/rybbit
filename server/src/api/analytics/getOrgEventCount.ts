import { FastifyReply, FastifyRequest } from "fastify";
import SqlString from "sqlstring";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getSitesUserHasAccessTo } from "../../lib/auth-utils.js";
import { processResults } from "./utils.js";

type OrgEventCountResponse = {
  event_date: string;
  pageview_count: number;
  custom_event_count: number;
  performance_count: number;
  event_count: number;
}[];

export async function getOrgEventCount(
  req: FastifyRequest<{
    Params: {
      organizationId: string;
    };
    Querystring: {
      startDate?: string;
      endDate?: string;
      timeZone?: string;
    };
  }>,
  res: FastifyReply
) {
  const { organizationId } = req.params;
  const { startDate, endDate, timeZone = "UTC" } = req.query;

  try {
    // Get all sites the user has access to
    const userSites = await getSitesUserHasAccessTo(req);

    // Filter to only sites in the requested organization
    const orgSites = userSites.filter(site => site.organizationId === organizationId);

    if (orgSites.length === 0) {
      return res.status(403).send({ error: "No access to organization or no sites found" });
    }

    const siteIds = orgSites.map((site: any) => site.siteId);

    // Build time filter for the query
    let timeFilter = "";
    let fillFromDate = "";
    let fillToDate = "";

    if (startDate && endDate) {
      timeFilter = `AND event_hour >= toTimeZone(
        toStartOfDay(toDateTime(${SqlString.escape(startDate)}, ${SqlString.escape(timeZone)})),
        'UTC'
      )
      AND event_hour < if(
        toDate(${SqlString.escape(endDate)}) = toDate(now(), ${SqlString.escape(timeZone)}),
        now(),
        toTimeZone(
          toStartOfDay(toDateTime(${SqlString.escape(endDate)}, ${SqlString.escape(timeZone)})) + INTERVAL 1 DAY,
          'UTC'
        )
      )`;

      // Set up WITH FILL parameters
      fillFromDate = `FROM toTimeZone(
        toStartOfDay(toDateTime(${SqlString.escape(startDate)}, ${SqlString.escape(timeZone)})),
        'UTC'
      )`;

      fillToDate = `TO if(
        toDate(${SqlString.escape(endDate)}) = toDate(now(), ${SqlString.escape(timeZone)}),
        toStartOfDay(now()) + INTERVAL 1 DAY,
        toTimeZone(
          toStartOfDay(toDateTime(${SqlString.escape(endDate)}, ${SqlString.escape(timeZone)})) + INTERVAL 1 DAY,
          'UTC'
        )
      )`;
    } else {
      // Default to last 30 days if no date range provided
      timeFilter = "AND event_hour >= now() - INTERVAL 30 DAY";
      fillFromDate = "FROM now() - INTERVAL 30 DAY";
      fillToDate = "TO now() + INTERVAL 1 DAY";
    }

    const query = `
      SELECT
        toStartOfDay(timestamp) as event_date,
        countIf(type = 'pageview') as pageview_count,
        countIf(type = 'custom_event') as custom_event_count,
        countIf(type = 'performance') as performance_count,
        count() as event_count
      FROM events
      WHERE site_id IN (${siteIds.map((id: number) => SqlString.escape(id)).join(", ")})
        AND type IN ('pageview', 'custom_event', 'performance')
        ${timeFilter.replace(/event_hour/g, "timestamp")}
      GROUP BY event_date
      ORDER BY event_date
      WITH FILL ${fillFromDate} ${fillToDate} STEP INTERVAL 1 DAY
    `;

    const result = await clickhouse.query({
      query,
      format: "JSONEachRow",
    });

    const data = await processResults<OrgEventCountResponse[number]>(result);
    return res.send({ data });
  } catch (error) {
    console.error("Error fetching organization event count:", error);
    return res.status(500).send({ error: "Failed to fetch organization event count" });
  }
}
