import { and, eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, member } from "../../db/postgres/schema.js";
import { clickhouse } from "../../db/clickhouse/clickhouse.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { processResults } from "../analytics/utils.js";

interface GetMonitorStatsRequest {
  Params: {
    monitorId: string;
  };
  Querystring: {
    period?: "24h" | "7d" | "30d" | "custom";
    start_date?: string;
    end_date?: string;
  };
}

export async function getMonitorStats(
  request: FastifyRequest<GetMonitorStatsRequest>,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;
  const { monitorId } = request.params;
  const { period = "24h", start_date, end_date } = request.query;

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

    // Calculate date range based on period
    let startDate: string;
    let endDate: string = new Date().toISOString();

    if (period === "custom" && start_date && end_date) {
      startDate = start_date;
      endDate = end_date;
    } else {
      const now = new Date();
      switch (period) {
        case "24h":
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case "7d":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case "30d":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Get aggregated stats from ClickHouse
    const statsQuery = `
      SELECT 
        count() as total_checks,
        countIf(status = 'success') as successful_checks,
        countIf(status = 'failure') as failed_checks,
        countIf(status = 'timeout') as timeout_checks,
        avg(response_time_ms) as avg_response_time,
        min(response_time_ms) as min_response_time,
        max(response_time_ms) as max_response_time,
        quantile(0.5)(response_time_ms) as p50_response_time,
        quantile(0.95)(response_time_ms) as p95_response_time,
        quantile(0.99)(response_time_ms) as p99_response_time,
        100 * countIf(status = 'success') / count() as uptime_percentage
      FROM monitor_events
      WHERE monitor_id = {monitorId: UInt32}
        AND timestamp >= {startDate: DateTime}
        AND timestamp <= {endDate: DateTime}
    `;

    const statsResult = await clickhouse.query({
      query: statsQuery,
      query_params: {
        monitorId: Number(monitorId),
        startDate,
        endDate,
      },
      format: "JSONEachRow",
    });

    const statsData = await processResults<{
      total_checks: number;
      successful_checks: number;
      failed_checks: number;
      timeout_checks: number;
      avg_response_time: number;
      min_response_time: number;
      max_response_time: number;
      p50_response_time: number;
      p95_response_time: number;
      p99_response_time: number;
      uptime_percentage: number;
    }>(statsResult);
    const stats = statsData[0] || {
      total_checks: 0,
      successful_checks: 0,
      failed_checks: 0,
      timeout_checks: 0,
      avg_response_time: 0,
      min_response_time: 0,
      max_response_time: 0,
      p50_response_time: 0,
      p95_response_time: 0,
      p99_response_time: 0,
      uptime_percentage: 0,
    };

    // Get response time distribution
    const distributionQuery = `
      SELECT 
        toStartOfHour(timestamp) as hour,
        avg(response_time_ms) as avg_response_time,
        count() as check_count,
        countIf(status = 'success') as success_count
      FROM monitor_events
      WHERE monitor_id = {monitorId: UInt32}
        AND timestamp >= {startDate: DateTime}
        AND timestamp <= {endDate: DateTime}
      GROUP BY hour
      ORDER BY hour ASC
    `;

    const distributionResult = await clickhouse.query({
      query: distributionQuery,
      query_params: {
        monitorId: Number(monitorId),
        startDate,
        endDate,
      },
      format: "JSONEachRow",
    });

    const distribution = await processResults(distributionResult);

    return reply.status(200).send({
      period,
      startDate,
      endDate,
      stats: {
        totalChecks: Number(stats.total_checks),
        successfulChecks: Number(stats.successful_checks),
        failedChecks: Number(stats.failed_checks),
        timeoutChecks: Number(stats.timeout_checks),
        uptimePercentage: Number(stats.uptime_percentage),
        responseTime: {
          avg: Number(stats.avg_response_time),
          min: Number(stats.min_response_time),
          max: Number(stats.max_response_time),
          p50: Number(stats.p50_response_time),
          p95: Number(stats.p95_response_time),
          p99: Number(stats.p99_response_time),
        },
      },
      distribution,
    });
  } catch (error) {
    console.error("Error retrieving monitor stats:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}