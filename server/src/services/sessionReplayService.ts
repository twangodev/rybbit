import { clickhouse } from "../db/clickhouse/clickhouse.js";
import {
  SessionReplayMetadata,
  RecordSessionReplayRequest,
  SessionReplayListItem,
  GetSessionReplayEventsResponse,
} from "../types/sessionReplay.js";
import { processResults } from "../api/analytics/utils.js";

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
      timestamp: new Date(event.timestamp),
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
          browser,
          browser_version,
          operating_system,
          operating_system_version,
          country,
          region,
          city,
          lat,
          lon,
          language,
          device_type,
          channel,
          hostname,
          referrer,
          user_agent
        FROM events
        WHERE site_id = {siteId:UInt16} 
          AND session_id = {sessionId:String}
        LIMIT 1
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
      user_agent?: string;
    };

    const mainResults = await processResults<MainSessionData>(mainSessionData);
    const sessionData = mainResults[0] || {};

    // Calculate duration
    const startTime = new Date(sessionReplayData.start_time);
    const endTime = sessionReplayData.end_time ? new Date(sessionReplayData.end_time) : null;
    const durationMs = endTime ? endTime.getTime() - startTime.getTime() : null;

    // Insert or update metadata
    await clickhouse.insert({
      table: "session_replay_metadata",
      values: [
        {
          site_id: siteId,
          session_id: sessionId,
          user_id: userId,
          start_time: startTime,
          end_time: endTime,
          duration_ms: durationMs,
          event_count: sessionReplayData.event_count || 0,
          compressed_size_bytes: sessionReplayData.compressed_size_bytes || 0,
          page_url: metadata.pageUrl || "",
          user_agent: sessionData.user_agent || "",
          country: sessionData.country || "",
          region: sessionData.region || "",
          city: sessionData.city || "",
          lat: sessionData.lat || 0,
          lon: sessionData.lon || 0,
          browser: sessionData.browser || "",
          browser_version: sessionData.browser_version || "",
          operating_system: sessionData.operating_system || "",
          operating_system_version: sessionData.operating_system_version || "",
          language: sessionData.language || "",
          screen_width: sessionReplayData.screen_width || 0,
          screen_height: sessionReplayData.screen_height || 0,
          device_type: sessionData.device_type || "",
          channel: sessionData.channel || "",
          hostname: sessionData.hostname || "",
          referrer: sessionData.referrer || "",
          has_replay_data: 1,
          recording_status: "recording",
        },
      ],
      format: "JSONEachRow",
    });
  }

  async markSessionComplete(
    siteId: number,
    sessionId: string
  ): Promise<void> {
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
      startDate?: Date;
      endDate?: Date;
      userId?: string;
    }
  ): Promise<SessionReplayListItem[]> {
    const { limit = 50, offset = 0, startDate, endDate, userId } = options;

    let whereConditions = [`site_id = {siteId:UInt16}`];
    const queryParams: any = { siteId, limit, offset };

    if (startDate) {
      whereConditions.push(`start_time >= {startDate:DateTime}`);
      queryParams.startDate = startDate;
    }

    if (endDate) {
      whereConditions.push(`start_time <= {endDate:DateTime}`);
      queryParams.endDate = endDate;
    }

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
      ORDER BY start_time DESC
      LIMIT {limit:UInt32}
      OFFSET {offset:UInt32}
    `;

    const result = await clickhouse.query({
      query,
      query_params: queryParams,
      format: "JSONEachRow",
    });

    return await processResults<SessionReplayListItem>(result);
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

    const metadataResults = await processResults<SessionReplayMetadata>(metadataResult);
    const metadata = metadataResults[0];

    if (!metadata) {
      throw new Error("Session replay not found");
    }

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
    const events = eventsResults.map((event) => ({
      timestamp: new Date(event.timestamp).getTime(),
      type: event.type,
      data: JSON.parse(event.data),
    }));

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