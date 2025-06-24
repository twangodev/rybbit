import { clickhouse } from "../db/clickhouse/clickhouse.js";
import {
  SessionReplayMetadata,
  RecordSessionReplayRequest,
  SessionReplayListItem,
  GetSessionReplayEventsResponse,
} from "../types/sessionReplay.js";
import { processResults, getTimeStatement } from "../api/analytics/utils.js";
import { FilterParams } from "@rybbit/shared";

export class SessionReplayService {
  async recordEvents(
    siteId: number,
    request: RecordSessionReplayRequest
  ): Promise<void> {
    const { sessionId, userId, events, metadata } = request;

    // Prepare events for batch insert
    const eventsToInsert = events.map((event, index) => ({
      site_id: siteId,
      session_id: sessionId,
      user_id: userId,
      timestamp: Math.floor(event.timestamp / 1000), // Convert to Unix timestamp (seconds)
      event_type: event.type,
      event_data: JSON.stringify(event.data),
      sequence_number: index,
      event_size_bytes: JSON.stringify(event.data).length,
      viewport_width: metadata?.viewportWidth || null,
      viewport_height: metadata?.viewportHeight || null,
      is_complete: 0,
    }));

    // Batch insert events
    if (eventsToInsert.length > 0) {
      await clickhouse.insert({
        table: "session_replay_events",
        values: eventsToInsert,
        format: "JSONEachRow",
      });
    }

    // Update or insert metadata
    if (metadata) {
      await this.updateSessionMetadata(siteId, sessionId, userId, metadata);
    }
  }

  async updateSessionMetadata(
    siteId: number,
    sessionId: string,
    userId: string,
    metadata: any
  ): Promise<void> {
    // Get existing session info from events table
    const sessionInfo = await clickhouse.query({
      query: `
        SELECT 
          MIN(timestamp) as start_time,
          MAX(timestamp) as end_time,
          COUNT() as event_count,
          SUM(event_size_bytes) as compressed_size_bytes,
          MAX(viewport_width) as screen_width,
          MAX(viewport_height) as screen_height
        FROM session_replay_events
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    type SessionInfoResult = {
      start_time: string;
      end_time: string | null;
      event_count: number;
      compressed_size_bytes: number;
      screen_width: number | null;
      screen_height: number | null;
    };

    const sessionResults = await processResults<SessionInfoResult>(sessionInfo);

    if (!sessionResults || sessionResults.length === 0) return;

    const sessionReplayData = sessionResults[0];

    // Get additional session data from main events table
    const mainSessionData = await clickhouse.query({
      query: `
        SELECT 
          argMax(browser, timestamp) as browser,
          argMax(browser_version, timestamp) as browser_version,
          argMax(operating_system, timestamp) as operating_system,
          argMax(operating_system_version, timestamp) as operating_system_version,
          argMax(country, timestamp) as country,
          argMax(region, timestamp) as region,
          argMax(city, timestamp) as city,
          argMax(lat, timestamp) as lat,
          argMax(lon, timestamp) as lon,
          argMax(language, timestamp) as language,
          argMax(device_type, timestamp) as device_type,
          argMax(channel, timestamp) as channel,
          argMax(hostname, timestamp) as hostname,
          argMin(referrer, timestamp) as referrer
        FROM events
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
      `,
      query_params: { siteId, sessionId },
      format: "JSONEachRow",
    });

    type MainSessionData = {
      browser?: string;
      browser_version?: string;
      operating_system?: string;
      operating_system_version?: string;
      country?: string;
      region?: string;
      city?: string;
      lat?: number;
      lon?: number;
      language?: string;
      device_type?: string;
      channel?: string;
      hostname?: string;
      referrer?: string;
    };

    const mainResults = await processResults<MainSessionData>(mainSessionData);
    const sessionData = mainResults[0] || {};
    
    console.log("Session data from events table:", sessionData);

    // Calculate duration
    const startTime = new Date(sessionReplayData.start_time);
    const endTime = sessionReplayData.end_time
      ? new Date(sessionReplayData.end_time)
      : null;
    const durationMs = endTime ? endTime.getTime() - startTime.getTime() : null;

    // Insert or update metadata
    await clickhouse.insert({
      table: "session_replay_metadata",
      values: [
        {
          site_id: siteId,
          session_id: sessionId,
          user_id: userId,
          start_time: Math.floor(startTime.getTime() / 1000), // Convert to Unix timestamp
          end_time: endTime ? Math.floor(endTime.getTime() / 1000) : null, // Convert to Unix timestamp
          duration_ms: durationMs,
          event_count: sessionReplayData.event_count || 0,
          compressed_size_bytes: sessionReplayData.compressed_size_bytes || 0,
          page_url: metadata.pageUrl || "",
          user_agent: "", // User agent not available in events table
          country: sessionData.country?.replace(/\0/g, '') || "", // Remove null bytes
          region: sessionData.region?.replace(/\0/g, '') || "",
          city: sessionData.city?.replace(/\0/g, '') || "",
          lat: sessionData.lat || 0,
          lon: sessionData.lon || 0,
          browser: sessionData.browser || "Unknown",
          browser_version: sessionData.browser_version || "",
          operating_system: sessionData.operating_system || "Unknown",
          operating_system_version: sessionData.operating_system_version || "",
          language: sessionData.language || "",
          screen_width: sessionReplayData.screen_width || 0,
          screen_height: sessionReplayData.screen_height || 0,
          device_type: sessionData.device_type || "desktop",
          channel: sessionData.channel || "direct",
          hostname: sessionData.hostname || "",
          referrer: sessionData.referrer || "",
          has_replay_data: 1,
          recording_status: "recording",
        },
      ],
      format: "JSONEachRow",
    });
  }

  async markSessionComplete(siteId: number, sessionId: string): Promise<void> {
    // Update recording status
    await clickhouse.query({
      query: `
        ALTER TABLE session_replay_metadata 
        UPDATE recording_status = 'completed' 
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
      `,
      query_params: { siteId, sessionId },
    });

    // Mark last event as complete
    await clickhouse.query({
      query: `
        ALTER TABLE session_replay_events 
        UPDATE is_complete = 1 
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
          AND sequence_number = (
            SELECT MAX(sequence_number) 
            FROM session_replay_events 
            WHERE site_id = {siteId:UInt16} 
              AND session_id = {sessionId:String}
          )
      `,
      query_params: { siteId, sessionId },
    });
  }

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
      userAgent: rawMetadata.user_agent,
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
