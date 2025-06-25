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
        recording_status,
        country,
        browser,
        device_type
      FROM session_replay_metadata
      WHERE ${whereConditions.join(" AND ")}
      ${timeStatement}
      ORDER BY start_time DESC
      LIMIT {limit:UInt32}
      OFFSET {offset:UInt32}
    `;

    console.log("SessionReplay Query:", query);
    console.log("Query Params:", queryParams);
    console.log("Time Statement:", timeStatement);
    console.log("Options passed to getTimeStatement:", JSON.stringify(options, null, 2));
    
    // First, let's check if there's any data in the table at all
    const countQuery = `SELECT COUNT(*) as total FROM session_replay_metadata WHERE site_id = {siteId:UInt16}`;
    const countResult = await clickhouse.query({
      query: countQuery,
      query_params: { siteId },
      format: "JSONEachRow",
    });
    const countData = await processResults<{total: number}>(countResult);
    console.log("Total session replay metadata records for site:", countData[0]?.total || 0);
    
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
    
    // Transform snake_case to camelCase
    const finalResults = rawResults.map((item: any) => ({
      sessionId: item.session_id,
      userId: item.user_id,
      startTime: item.start_time,
      endTime: item.end_time,
      durationMs: item.duration_ms,
      pageUrl: item.page_url,
      eventCount: item.event_count,
      recordingStatus: item.recording_status,
      country: item.country,
      browser: item.browser,
      deviceType: item.device_type,
    }));
    
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
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        LIMIT 1
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    const metadataResults = await processResults<any>(metadataResult);
    const rawMetadata = metadataResults[0];

    if (!rawMetadata) {
      throw new Error("Session replay not found");
    }

    // Transform snake_case to camelCase for metadata
    const metadata = {
      siteId: rawMetadata.site_id,
      sessionId: rawMetadata.session_id,
      userId: rawMetadata.user_id,
      startTime: rawMetadata.start_time,
      endTime: rawMetadata.end_time,
      durationMs: rawMetadata.duration_ms,
      eventCount: rawMetadata.event_count,
      compressedSizeBytes: rawMetadata.compressed_size_bytes,
      pageUrl: rawMetadata.page_url,
      country: rawMetadata.country,
      region: rawMetadata.region,
      city: rawMetadata.city,
      lat: rawMetadata.lat,
      lon: rawMetadata.lon,
      browser: rawMetadata.browser,
      browserVersion: rawMetadata.browser_version,
      operatingSystem: rawMetadata.operating_system,
      operatingSystemVersion: rawMetadata.operating_system_version,
      language: rawMetadata.language,
      screenWidth: rawMetadata.screen_width,
      screenHeight: rawMetadata.screen_height,
      deviceType: rawMetadata.device_type,
      channel: rawMetadata.channel,
      hostname: rawMetadata.hostname,
      referrer: rawMetadata.referrer,
      hasReplayData: rawMetadata.has_replay_data,
      recordingStatus: rawMetadata.recording_status,
      createdAt: rawMetadata.created_at,
    };

    // Get events
    const eventsResult = await clickhouse.query({
      query: `
        SELECT 
          timestamp,
          event_type as type,
          event_data as data
        FROM session_replay_events
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        ORDER BY sequence_number ASC
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    type EventRow = {
      timestamp: string;
      type: string;
      data: string;
    };

    const eventsResults = await processResults<EventRow>(eventsResult);
    console.log("Raw event timestamps from DB:", eventsResults.map(e => ({ timestamp: e.timestamp, type: e.type })));
    
    const events = eventsResults.map((event) => {
      // The timestamp from ClickHouse is already in seconds (Unix timestamp)
      // We need to convert it to milliseconds for rrweb
      const timestamp = new Date(event.timestamp).getTime();
      console.log(`Converting timestamp: ${event.timestamp} -> ${timestamp}`);
      
      return {
        timestamp,
        type: event.type, // Keep as string for now to match interface
        data: JSON.parse(event.data),
      };
    });

    console.log(`Session ${sessionId} has ${events.length} events`);
    console.log("Final events:", events.map(e => ({ type: e.type, timestamp: e.timestamp })));
    
    // Check if we have a FullSnapshot event (type 2)
    const hasFullSnapshot = events.some(e => e.type === "2" || e.type.toString() === "2");
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