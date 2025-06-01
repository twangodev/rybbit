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
    // Validate the request body
    const validatedBody = replayEventSchema.parse(request.body);

    const { site_id, session_id, user_id, events, is_complete, timestamp } =
      validatedBody;

    // Compress events data for storage efficiency
    const eventsJson = JSON.stringify(events);
    const compressedSize = Buffer.byteLength(eventsJson, "utf8");

    // Insert events into ClickHouse
    const eventRows = events.map((event, index) => ({
      site_id,
      session_id,
      user_id: user_id || "",
      timestamp: new Date(timestamp).toISOString(),
      event_type: event.type || "unknown",
      event_data: JSON.stringify(event),
      sequence_number: event.timestamp || index,
      is_complete: is_complete ? 1 : 0,
    }));

    if (eventRows.length > 0) {
      await clickhouse.insert({
        table: "session_replay_events",
        values: eventRows,
        format: "JSONEachRow",
      });
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
      created_at: new Date().toISOString(),
    };

    await clickhouse.insert({
      table: "session_replay_metadata",
      values: [metadataRow],
      format: "JSONEachRow",
    });

    reply.status(200).send({ success: true });
  } catch (error) {
    console.error("Error ingesting replay events:", error);

    if (error instanceof z.ZodError) {
      reply.status(400).send({
        error: "Invalid request body",
        details: error.errors,
      });
    } else {
      reply.status(500).send({
        error: "Internal server error",
      });
    }
  }
}
