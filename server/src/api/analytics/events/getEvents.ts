import { FastifyReply, FastifyRequest } from "fastify";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import {
  processResults,
  getTimeStatement,
  getFilterStatement,
} from "../utils.js";
import { getUserHasAccessToSitePublic } from "../../../lib/auth-utils.js";
import { FilterParams } from "@rybbit/shared";

export type GetEventsResponse = {
  timestamp: string;
  event_name: string;
  properties: string; // This will be populated from the props column
  user_id: string;
  pathname: string;
  querystring: string;
  hostname: string;
  referrer: string;
  browser: string;
  operating_system: string;
  country: string;
  device_type: string;
  type: string;
  page_title: string;
}[];

interface GetEventsRequest {
  Params: {
    site: string;
  };
  Querystring: FilterParams<{
    page?: string;
    pageSize?: string;
    count?: string; // Keeping for backward compatibility
    afterTimestamp?: string; // ISO timestamp to fetch events after
  }>;
}

export async function getEvents(
  req: FastifyRequest<GetEventsRequest>,
  res: FastifyReply
) {
  const { site } = req.params;
  const {
    startDate,
    endDate,
    timeZone,
    filters,
    page = "1",
    pageSize = "20",
    count,
    afterTimestamp,
  } = req.query;

  const userHasAccessToSite = await getUserHasAccessToSitePublic(req, site);
  if (!userHasAccessToSite) {
    return res.status(403).send({ error: "Forbidden" });
  }

  // Use count if provided (for backward compatibility), otherwise use pageSize
  const limit = count ? parseInt(count, 10) : parseInt(pageSize, 10);
  const offset = (parseInt(page, 10) - 1) * limit;

  // Get time and filter statements if parameters are provided
  let timeStatement = "";
  
  if (afterTimestamp) {
    // If afterTimestamp is provided, use it as the lower bound
    timeStatement = `AND timestamp > parseDateTimeBestEffort({afterTimestamp:String})`;
  } else if (startDate || endDate) {
    timeStatement = getTimeStatement(req.query);
  } else {
    timeStatement = "AND timestamp > now() - INTERVAL 30 MINUTE"; // Default to last 30 minutes if no time range specified
  }

  const filterStatement = filters ? getFilterStatement(filters) : "";

  try {
    // Skip count query when using afterTimestamp (real-time mode)
    let totalCount = 0;
    
    if (!afterTimestamp) {
      // First, get the total count for pagination metadata
      const countQuery = `
        SELECT
          COUNT(*) as total
        FROM events
        WHERE
          site_id = {siteId:Int32}
          AND (type = 'custom_event' OR type = 'pageview')
          ${timeStatement}
          ${filterStatement}
      `;

      const countQueryParams: any = {
        siteId: Number(site),
      };

      const countResult = await clickhouse.query({
        query: countQuery,
        format: "JSONEachRow",
        query_params: countQueryParams,
      });

      const countData = await processResults<{ total: number }>(countResult);
      totalCount = countData[0]?.total || 0;
    }

    // Then, get the actual events with pagination
    const eventsQuery = `
      SELECT
        timestamp,
        event_name,
        toString(props) as properties, -- Convert props Map to string
        user_id,
        pathname,
        querystring,
        hostname,
        page_title,
        referrer,
        browser,
        operating_system,
        country,
        device_type,
        type
      FROM events
      WHERE
        site_id = {siteId:Int32}
        AND (type = 'custom_event' OR type = 'pageview')
        ${timeStatement}
        ${filterStatement}
      ORDER BY timestamp DESC
      LIMIT {limit:Int32}${afterTimestamp ? '' : ' OFFSET {offset:Int32}'}
    `;

    const eventsQueryParams: any = {
      siteId: Number(site),
      limit: Number(limit),
    };
    
    // Only add offset if not using afterTimestamp
    if (!afterTimestamp) {
      eventsQueryParams.offset = Number(offset);
    } else {
      eventsQueryParams.afterTimestamp = afterTimestamp;
    }

    const eventsResult = await clickhouse.query({
      query: eventsQuery,
      format: "JSONEachRow",
      query_params: eventsQueryParams,
    });

    const events =
      await processResults<GetEventsResponse[number]>(eventsResult);

    // Return different response structure based on mode
    if (afterTimestamp) {
      // Real-time mode: just return events
      return res.send({
        data: events,
        isRealtime: true,
      });
    } else {
      // Regular mode: include pagination
      return res.send({
        data: events,
        pagination: {
          total: totalCount,
          page: parseInt(page, 10),
          pageSize: limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).send({ error: "Failed to fetch events" });
  }
}
