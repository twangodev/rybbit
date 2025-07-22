import { and, eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, member } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { processResults } from "../analytics/utils.js";

interface GetMonitorEventsRequest {
  Params: {
    monitorId: string;
  };
  Querystring: {
    start_date?: string;
    end_date?: string;
    limit?: string;
    offset?: string;
  };
}

export async function getMonitorEvents(
  request: FastifyRequest<GetMonitorEventsRequest>,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;
  const { monitorId } = request.params;
  const { start_date, end_date, limit = "100", offset = "0" } = request.query;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    // First check if monitor exists and user has access
    const monitor = await db.query.uptimeMonitors.findFirst({
      where: eq(uptimeMonitors.id, Number(monitorId)),
    });

    if (!monitor) {
      return reply.status(404).send({ error: "Monitor not found" });
    }

    // Check if user has access to the monitor's organization
    const userHasAccess = await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, monitor.organizationId)
      ),
    });

    if (!userHasAccess) {
      return reply.status(403).send({ error: "Access denied" });
    }

    // Build query for ClickHouse
    let query = `
      SELECT 
        monitor_id,
        organization_id,
        timestamp,
        monitor_type,
        monitor_url,
        monitor_name,
        region,
        status,
        status_code,
        response_time_ms,
        dns_time_ms,
        tcp_time_ms,
        tls_time_ms,
        ttfb_ms,
        transfer_time_ms,
        validation_errors,
        response_headers,
        response_size_bytes,
        port,
        error_message,
        error_type
      FROM monitor_events
      WHERE monitor_id = {monitorId: UInt32}
    `;

    const queryParams: any = { monitorId: Number(monitorId) };

    if (start_date) {
      query += ` AND timestamp >= {startDate: DateTime}`;
      queryParams.startDate = start_date;
    }

    if (end_date) {
      query += ` AND timestamp <= {endDate: DateTime}`;
      queryParams.endDate = end_date;
    }

    query += ` ORDER BY timestamp DESC`;
    query += ` LIMIT {limit: UInt32} OFFSET {offset: UInt32}`;
    queryParams.limit = Number(limit);
    queryParams.offset = Number(offset);

    const result = await clickhouse.query({
      query,
      query_params: queryParams,
      format: "JSONEachRow",
    });

    const events = await processResults(result);

    // Get total count
    let countQuery = `
      SELECT count() as total
      FROM monitor_events
      WHERE monitor_id = {monitorId: UInt32}
    `;

    const countParams: any = { monitorId: Number(monitorId) };

    if (start_date) {
      countQuery += ` AND timestamp >= {startDate: DateTime}`;
      countParams.startDate = start_date;
    }

    if (end_date) {
      countQuery += ` AND timestamp <= {endDate: DateTime}`;
      countParams.endDate = end_date;
    }

    const countResult = await clickhouse.query({
      query: countQuery,
      query_params: countParams,
      format: "JSONEachRow",
    });

    const countData = await processResults<{ total: number }>(countResult);
    const total = countData[0]?.total || 0;

    return reply.status(200).send({
      events,
      pagination: {
        total: Number(total),
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error) {
    console.error("Error retrieving monitor events:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}