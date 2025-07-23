import { and, eq, inArray, desc } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, uptimeMonitorStatus, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { getMonitorsQuerySchema, type GetMonitorsQuery } from "./schemas.js";

interface GetMonitorsRequest {
  Querystring: GetMonitorsQuery;
}

export async function getMonitors(
  request: FastifyRequest<GetMonitorsRequest>,
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
    // Validate query parameters with Zod
    const query = getMonitorsQuerySchema.parse(request.query);
    const { enabled, monitorType, organizationId, limit, offset } = query;

    // Build where conditions
    const orgIds = userOrgs.map(org => org.organizationId);
    const conditions = [];
    
    // Filter by specific organization if provided, otherwise all user's organizations
    if (organizationId) {
      // Check if user has access to the specified organization
      if (!orgIds.includes(organizationId)) {
        return reply.status(403).send({ error: "Access denied to organization" });
      }
      conditions.push(eq(uptimeMonitors.organizationId, organizationId));
    } else {
      // Use inArray for multiple orgs
      conditions.push(inArray(uptimeMonitors.organizationId, orgIds));
    }
    
    if (enabled !== undefined) {
      conditions.push(eq(uptimeMonitors.enabled, enabled));
    }
    
    if (monitorType) {
      conditions.push(eq(uptimeMonitors.monitorType, monitorType));
    }

    // Get monitors with their status
    const monitors = await db
      .select({
        monitor: uptimeMonitors,
        status: uptimeMonitorStatus,
      })
      .from(uptimeMonitors)
      .leftJoin(uptimeMonitorStatus, eq(uptimeMonitors.id, uptimeMonitorStatus.monitorId))
      .where(and(...conditions))
      .orderBy(desc(uptimeMonitors.createdAt))
      .limit(limit)
      .offset(offset);

    const result = monitors.map((row) => ({
      ...row.monitor,
      status: row.status,
    }));

    return reply.status(200).send(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as any;
      return reply.status(400).send({ 
        error: "Validation error",
        details: zodError.errors 
      });
    }
    console.error("Error retrieving monitors:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}