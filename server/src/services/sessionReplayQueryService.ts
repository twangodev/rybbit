import { clickhouse } from "../db/clickhouse/clickhouse.js";
import {
  SessionReplayMetadata,
  SessionReplayListItem,
  GetSessionReplayEventsResponse,
} from "../types/sessionReplay.js";
import { processResults, getTimeStatement } from "../api/analytics/utils.js";
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
    >
  ): Promise<SessionReplayListItem[]> {
    const { limit = 50, offset = 0, userId } = options;

    const timeStatement = getTimeStatement(options).replace(
      /timestamp/g,
      "start_time"
    );

    let whereConditions = [`site_id = {siteId:UInt16}`];
    const queryParams: any = { siteId, limit, offset };

    if (userId) {
      whereConditions.push(`user_id = {userId:String}`);
      queryParams.userId = userId;
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
        AND EXISTS (
          SELECT 1 FROM session_replay_events 
          WHERE session_replay_events.site_id = session_replay_metadata.site_id 
            AND session_replay_events.session_id = session_replay_metadata.session_id 
            AND event_type = '2'
        )
      ${timeStatement}
      ORDER BY start_time DESC
      LIMIT {limit:UInt32}
      OFFSET {offset:UInt32}
    `;

    console.log("SessionReplay Query:", query);
    console.log("Query Params:", queryParams);
    console.log("Time Statement:", timeStatement);
    console.log(
      "Options passed to getTimeStatement:",
      JSON.stringify(options, null, 2)
    );

    // First, let's check if there's any data in the table at all
    const countQuery = `SELECT COUNT(*) as total FROM session_replay_metadata WHERE site_id = {siteId:UInt16}`;
    const countResult = await clickhouse.query({
      query: countQuery,
      query_params: { siteId },
      format: "JSONEachRow",
    });
    const countData = await processResults<{ total: number }>(countResult);
    console.log(
      "Total session replay metadata records for site:",
      countData[0]?.total || 0
    );

    // Debug: Check actual dates in the data
    const dateCheckQuery = `SELECT session_id, start_time, toDate(start_time) as date_only FROM session_replay_metadata WHERE site_id = {siteId:UInt16} ORDER BY start_time DESC LIMIT 5`;
    const dateCheckResult = await clickhouse.query({
      query: dateCheckQuery,
      query_params: { siteId },
      format: "JSONEachRow",
    });
    const dateCheckData = await processResults<any>(dateCheckResult);
    console.log("Recent session replay dates:", dateCheckData);

    const result = await clickhouse.query({
      query,
      query_params: queryParams,
      format: "JSONEachRow",
    });

    const rawResults = await processResults<any>(result);
    console.log("Raw results count:", rawResults.length);

    const finalResults = rawResults;

    console.log("Final results count:", finalResults.length);
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
    console.log(
      "Raw event timestamps from DB:",
      eventsResults.map((e) => ({ timestamp: e.timestamp, type: e.type }))
    );

    const events = eventsResults.map((event) => {
      // Timestamp is already in milliseconds from the SQL query
      const timestamp = event.timestamp;
      console.log(`Event timestamp: ${timestamp}`);

      return {
        timestamp,
        type: event.type, // Keep as string for now to match interface
        data: JSON.parse(event.data),
      };
    });

    console.log(`Session ${sessionId} has ${events.length} events`);
    console.log(
      "Final events:",
      events.map((e) => ({ type: e.type, timestamp: e.timestamp }))
    );

    // Check if we have a FullSnapshot event (type 2)
    const hasFullSnapshot = events.some(
      (e) => e.type === "2" || e.type.toString() === "2"
    );
    console.log("Has FullSnapshot (type 2):", hasFullSnapshot);

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
