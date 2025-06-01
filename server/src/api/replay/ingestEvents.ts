import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { createBasePayload } from "../../tracker/trackingUtils.js";

// Validation schema for replay events
const replayEventSchema = z.object({
  site_id: z.number().int().positive(),
  session_id: z.string().uuid(),
  user_id: z.string().optional(),
  events: z.array(z.any()), // rrweb events can have various structures
  is_complete: z.boolean().default(false),
  timestamp: z.string().datetime(),
});

type ReplayEventPayload = z.infer<typeof replayEventSchema>;

export async function ingestReplayEvents(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    console.log("[REPLAY INGEST] Starting replay event ingestion");
    console.log(
      "[REPLAY INGEST] Request body:",
      JSON.stringify(request.body, null, 2)
    );

    // Validate the request body
    const validatedBody = replayEventSchema.parse(request.body);
    console.log("[REPLAY INGEST] Validation successful");

    const { site_id, session_id, user_id, events, is_complete, timestamp } =
      validatedBody;

    console.log("[REPLAY INGEST] Processing:", {
      site_id,
      session_id,
      user_id,
      events_count: events.length,
      is_complete,
      timestamp,
    });

    // Compress events data for storage efficiency
    const eventsJson = JSON.stringify(events);
    const compressedSize = Buffer.byteLength(eventsJson, "utf8");

    // Insert events into ClickHouse
    const eventRows = events.map((event, index) => {
      // Safely stringify event data, handling potential circular references
      let eventDataString;
      try {
        eventDataString =
          typeof event === "string" ? event : JSON.stringify(event);
      } catch (error) {
        console.warn(
          "[REPLAY INGEST] Failed to stringify event, using fallback:",
          error
        );
        eventDataString = JSON.stringify({
          type: event.type || "unknown",
          error: "stringify_failed",
        });
      }

      return {
        site_id,
        session_id,
        user_id: user_id || "",
        timestamp: new Date(timestamp).toISOString(),
        event_type: String(event.type || "unknown"),
        event_data: eventDataString,
        sequence_number: event.timestamp || index,
        is_complete: is_complete ? 1 : 0,
      };
    });

    console.log(
      "[REPLAY INGEST] Inserting",
      eventRows.length,
      "events into session_replay_events"
    );
    if (eventRows.length > 0) {
      await clickhouse.insert({
        table: "session_replay_events",
        values: eventRows,
        format: "JSONEachRow",
      });
      console.log("[REPLAY INGEST] Events insertion successful");
    }

    // Update or insert session metadata
    const metadataRow = {
      site_id,
      session_id,
      user_id: user_id || "",
      start_time: new Date(timestamp).toISOString(),
      end_time: is_complete ? new Date().toISOString() : null,
      duration_ms: null, // Will be calculated when session is complete
      event_count: events.length,
      compressed_size_bytes: compressedSize,
      page_url: request.headers.referer || "",
      user_agent: request.headers["user-agent"] || "",
      // Add all the metadata columns with defaults to match the schema
      country: "",
      region: "",
      city: "",
      lat: 0,
      lon: 0,
      browser: "",
      browser_version: "",
      operating_system: "",
      operating_system_version: "",
      language: "",
      screen_width: 0,
      screen_height: 0,
      device_type: "",
      channel: "",
      hostname: "",
      referrer: request.headers.referer || "",
      created_at: new Date().toISOString(),
    };

    console.log(
      "[REPLAY INGEST] Inserting metadata row:",
      JSON.stringify(metadataRow, null, 2)
    );
    await clickhouse.insert({
      table: "session_replay_metadata",
      values: [metadataRow],
      format: "JSONEachRow",
    });
    console.log("[REPLAY INGEST] Metadata insertion successful");

    console.log("[REPLAY INGEST] Ingestion completed successfully");
    reply.status(200).send({ success: true });
  } catch (error: any) {
    console.error("Error ingesting replay events:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error instanceof z.ZodError) {
      reply.status(400).send({
        error: "Invalid request body",
        details: error.errors,
      });
    } else {
      reply.status(500).send({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
}
