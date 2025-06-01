import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getTimeStatement } from "../analytics/utils.js";
import SqlString from "sqlstring";

// Validation schema for URL parameters
const getSessionsParamsSchema = z.object({
  site: z.string().transform(Number),
});

// Validation schema for query parameters
const getSessionsQuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeZone: z.string().default("UTC"),
  user_id: z.string().optional(),
});

export async function getReplaySessions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const params = getSessionsParamsSchema.parse(request.params);
    const query = getSessionsQuerySchema.parse(request.query);
    const { site: site_id } = params;
    const { page, limit, startDate, endDate, timeZone, user_id } = query;

    console.log("[REPLAY SESSIONS] Query parameters:", {
      site_id,
      page,
      limit,
      startDate,
      endDate,
      timeZone,
      user_id,
    });

    const offset = (page - 1) * limit;

    // Build WHERE conditions with proper type handling
    let whereConditions = [`site_id = ${site_id}`];

    if (user_id) {
      whereConditions.push(`user_id = ${SqlString.escape(user_id)}`);
    }

    // Use the proper time filtering logic from analytics utils
    // Note: session_replay_metadata uses start_time instead of timestamp
    let timeFilter = "";
    if (startDate || endDate) {
      timeFilter = getTimeStatement({
        date: {
          startDate,
          endDate,
          timeZone,
        },
      });
      // Replace 'timestamp' with 'start_time' for session replay metadata table
      timeFilter = timeFilter.replace(/timestamp/g, "start_time");
    }

    const whereClause = whereConditions.join(" AND ");

    // Get sessions with metadata - using FINAL for ReplacingMergeTree
    const sessionsQuery = `
      SELECT
        session_id,
        user_id,
        start_time,
        end_time,
        duration_ms,
        event_count,
        compressed_size_bytes,
        page_url,
        user_agent,
        created_at
      FROM session_replay_metadata FINAL
      WHERE ${whereClause}${timeFilter}
      ORDER BY start_time DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    console.log("[REPLAY SESSIONS] Executing query:", sessionsQuery);

    const sessions = await clickhouse.query({
      query: sessionsQuery,
      format: "JSONEachRow",
    });

    const sessionData = await sessions.json();
    console.log(
      "[REPLAY SESSIONS] Query returned",
      sessionData.length,
      "sessions"
    );

    // Get total count for pagination - using FINAL for ReplacingMergeTree
    const countQuery = `
      SELECT count() as total
      FROM session_replay_metadata FINAL
      WHERE ${whereClause}${timeFilter}
    `;

    console.log("[REPLAY SESSIONS] Executing count query:", countQuery);

    const countResult = await clickhouse.query({
      query: countQuery,
      format: "JSONEachRow",
    });

    const countData = (await countResult.json()) as Array<{ total: number }>;
    const total = countData[0]?.total || 0;
    console.log("[REPLAY SESSIONS] Total count:", total);

    reply.status(200).send({
      sessions: sessionData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching replay sessions:", error);

    if (error instanceof z.ZodError) {
      reply.status(400).send({
        error: "Invalid query parameters",
        details: error.errors,
      });
    } else {
      reply.status(500).send({
        error: "Internal server error",
      });
    }
  }
}
