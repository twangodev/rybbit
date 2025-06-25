import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import {
  SessionReplayMetadata,
  SessionReplayListItem,
  GetSessionReplayEventsResponse,
} from "../../types/sessionReplay.js";
import {
  processResults,
  getTimeStatement,
  getFilterStatement,
} from "../../api/analytics/utils.js";
import { FilterParams } from "@rybbit/shared";

/**
 * Service responsible for querying/retrieving session replay data
 * Handles listing sessions and getting replay events
 */
export class SessionReplayQueryService {
  async getSessionReplayList(
    siteId: number,
    options: {
      limit?: number;
      offset?: number;
      userId?: string;
    } & Pick<
      FilterParams,
      | "startDate"
      | "endDate"
      | "timeZone"
      | "pastMinutesStart"
      | "pastMinutesEnd"
      | "filters"
    >
  ): Promise<SessionReplayListItem[]> {
    const { limit = 50, offset = 0, userId } = options;

    const timeStatement = getTimeStatement(options).replace(
      /timestamp/g,
      "start_time"
    );

    const filterStatement = getFilterStatement(options.filters || "");

    let whereConditions = [`site_id = {siteId:UInt16}`];
    const queryParams: any = { siteId, limit, offset };

    if (userId) {
      whereConditions.push(`user_id = {userId:String}`);
      queryParams.userId = userId;
    }

    // Build the base query for session IDs that have replay events
    let sessionIdsSubquery = `
      SELECT DISTINCT session_id
      FROM session_replay_events
      WHERE site_id = {siteId:UInt16} AND event_type = '2'
    `;

    // If filters are present, we need to further filter by sessions that match the filter criteria
    if (filterStatement) {
      sessionIdsSubquery = `
        SELECT DISTINCT srm.session_id
        FROM session_replay_metadata srm
        FINAL
        WHERE srm.site_id = {siteId:UInt16}
          AND srm.session_id IN (
            SELECT DISTINCT session_id
            FROM session_replay_events
            WHERE site_id = {siteId:UInt16} AND event_type = '2'
          )
          AND srm.session_id IN (
            SELECT DISTINCT session_id
            FROM events
            WHERE site_id = {siteId:UInt16}
              ${filterStatement}
          )
      `;
    }

    const query = `
      SELECT 
        session_id,
        user_id,
        start_time,
        end_time,
        duration_ms,
        page_url,
        event_count,
        country,
        region,
        city,
        browser,
        browser_version,
        operating_system,
        operating_system_version,
        device_type,
        screen_width,
        screen_height
      FROM session_replay_metadata
      FINAL
      WHERE ${whereConditions.join(" AND ")}
        AND event_count >= 2
        AND session_id IN (${sessionIdsSubquery})
      ${timeStatement}
      ORDER BY start_time DESC
      LIMIT {limit:UInt32}
      OFFSET {offset:UInt32}
    `;

    const result = await clickhouse.query({
      query,
      query_params: queryParams,
      format: "JSONEachRow",
    });

    const rawResults = await processResults<any>(result);

    const finalResults = rawResults;

    return finalResults;
  }

  async getSessionReplayEvents(
    siteId: number,
    sessionId: string
  ): Promise<GetSessionReplayEventsResponse> {
    // Get metadata
    const metadataResult = await clickhouse.query({
      query: `
        SELECT *
        FROM session_replay_metadata
        FINAL
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        LIMIT 1
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    const metadataResults = await processResults<any>(metadataResult);
    const metadata = metadataResults[0];

    if (!metadata) {
      throw new Error("Session replay not found");
    }

    // Get events
    const eventsResult = await clickhouse.query({
      query: `
        SELECT 
          toUnixTimestamp64Milli(timestamp) as timestamp,
          event_type as type,
          event_data as data
        FROM session_replay_events
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        ORDER BY timestamp ASC, sequence_number ASC
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    type EventRow = {
      timestamp: number;
      type: string;
      data: string;
    };

    const eventsResults = await processResults<EventRow>(eventsResult);

    const events = eventsResults.map((event) => {
      // Timestamp is already in milliseconds from the SQL query
      const timestamp = event.timestamp;

      return {
        timestamp,
        type: event.type, // Keep as string for now to match interface
        data: JSON.parse(event.data),
      };
    });

    return {
      events,
      metadata,
    };
  }

  async getSessionReplayMetadata(
    siteId: number,
    sessionId: string
  ): Promise<SessionReplayMetadata | null> {
    const result = await clickhouse.query({
      query: `
        SELECT *
        FROM session_replay_metadata
        FINAL
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        LIMIT 1
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    const results = await processResults<SessionReplayMetadata>(result);
    return results[0] || null;
  }
}
