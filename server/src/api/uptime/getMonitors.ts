import { and, eq, inArray } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, uptimeMonitorStatus, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";

interface GetMonitorsQuery {
  Querystring: {
    enabled?: "true" | "false";
    monitor_type?: "http" | "tcp";
  };
}

export async function getMonitors(
  request: FastifyRequest<GetMonitorsQuery>,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }
  
  // Get user's organizations
  const userOrgs = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId));
    
  if (userOrgs.length === 0) {
    return reply.status(403).send({ error: "No organization access" });
  }

  try {
    const { enabled, monitor_type } = request.query;

    // Build where conditions - get monitors from all user's organizations
    const orgIds = userOrgs.map(org => org.organizationId);
    const conditions = [];
    
    // Use inArray for multiple orgs
    conditions.push(inArray(uptimeMonitors.organizationId, orgIds));
    
    if (enabled !== undefined) {
      conditions.push(eq(uptimeMonitors.enabled, enabled === "true"));
    }
    
    if (monitor_type) {
      conditions.push(eq(uptimeMonitors.monitorType, monitor_type));
    }

    // Get monitors with their status
    const monitors = await db
      .select({
        monitor: uptimeMonitors,
        status: uptimeMonitorStatus,
      })
      .from(uptimeMonitors)
      .leftJoin(uptimeMonitorStatus, eq(uptimeMonitors.id, uptimeMonitorStatus.monitorId))
      .where(and(...conditions));

    const result = monitors.map((row) => ({
      ...row.monitor,
      status: row.status,
    }));

    return reply.status(200).send(result);
  } catch (error) {
    console.error("Error retrieving monitors:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}