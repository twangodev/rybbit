import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../db/postgres/postgres.js";
import { member, uptimeIncidents, uptimeMonitors } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";

// Schemas
const incidentStatusSchema = z.enum(["active", "acknowledged", "resolved", "all"]);

const getIncidentsQuerySchema = z.object({
  status: incidentStatusSchema.default("all"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

const incidentIdParamsSchema = z.object({
  id: z.coerce.number().int(),
});

const incidentSchema = z.object({
  id: z.number(),
  organizationId: z.string(),
  monitorId: z.number(),
  monitorName: z.string(),
  region: z.string().nullable(),
  startTime: z.string(),
  endTime: z.string().nullable(),
  status: z.string(),
  acknowledgedBy: z.string().nullable(),
  acknowledgedAt: z.string().nullable(),
  resolvedBy: z.string().nullable(),
  resolvedAt: z.string().nullable(),
  lastError: z.string().nullable(),
  lastErrorType: z.string().nullable(),
  failureCount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const incidentsRoutes = async (server: FastifyInstance) => {
  // Get incidents
  server.route({
    method: "GET",
    url: "/api/uptime/incidents",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
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

      const organizationIds = userOrgs.map((org) => org.organizationId);

      const query = getIncidentsQuerySchema.parse(request.query);
      const { status, limit, offset } = query;

      // Build where conditions
      const conditions = [inArray(uptimeIncidents.organizationId, organizationIds)];

      if (status !== "all") {
        conditions.push(eq(uptimeIncidents.status, status));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(uptimeIncidents)
        .where(and(...conditions));

      const total = Number(countResult[0]?.count || 0);

      // Get incidents with monitor details
      const incidents = await db
        .select({
          incident: uptimeIncidents,
          monitor: {
            name: uptimeMonitors.name,
            monitorType: uptimeMonitors.monitorType,
            httpConfig: uptimeMonitors.httpConfig,
            tcpConfig: uptimeMonitors.tcpConfig,
          },
        })
        .from(uptimeIncidents)
        .leftJoin(uptimeMonitors, eq(uptimeIncidents.monitorId, uptimeMonitors.id))
        .where(and(...conditions))
        .orderBy(desc(uptimeIncidents.startTime))
        .limit(limit)
        .offset(offset);

      // Flatten the structure and add monitor name
      const incidentsWithMonitorName = incidents.map((row) => {
        // Determine monitor display name with fallback
        let monitorName = "Unknown Monitor";
        if (row.monitor) {
          if (row.monitor.name) {
            monitorName = row.monitor.name;
          } else if (row.monitor.monitorType === "http" && row.monitor.httpConfig) {
            monitorName = (row.monitor.httpConfig as any).url || "HTTP Monitor";
          } else if (row.monitor.monitorType === "tcp" && row.monitor.tcpConfig) {
            const config = row.monitor.tcpConfig as any;
            monitorName = `${config.host}:${config.port}` || "TCP Monitor";
          }
        }

        return {
          ...row.incident,
          monitorName,
        };
      });

      return reply.send({
        incidents: incidentsWithMonitorName,
        pagination: {
          total,
          limit,
          offset,
        },
      });
    },
  });

  // Acknowledge incident
  server.route({
    method: "PATCH",
    url: "/api/uptime/incidents/:id/acknowledge",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const params = incidentIdParamsSchema.parse(request.params);
      const { id } = params;

      // Get user's organizations
      const userOrgs = await db
        .select({ organizationId: member.organizationId })
        .from(member)
        .where(eq(member.userId, userId));

      if (userOrgs.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const organizationIds = userOrgs.map((org) => org.organizationId);

      // Verify incident belongs to user's organization
      const incident = await db
        .select()
        .from(uptimeIncidents)
        .where(and(eq(uptimeIncidents.id, id), inArray(uptimeIncidents.organizationId, organizationIds)))
        .limit(1);

      if (!incident[0]) {
        return reply.code(404).send({ error: "Incident not found" });
      }

      if (incident[0].status === "resolved") {
        return reply.code(400).send({ error: "Cannot acknowledge resolved incident" });
      }

      // Update incident
      const now = new Date().toISOString();
      const [updated] = await db
        .update(uptimeIncidents)
        .set({
          status: "acknowledged",
          acknowledgedBy: userId,
          acknowledgedAt: now,
          updatedAt: now,
        })
        .where(eq(uptimeIncidents.id, id))
        .returning({
          id: uptimeIncidents.id,
          status: uptimeIncidents.status,
          acknowledgedBy: uptimeIncidents.acknowledgedBy,
          acknowledgedAt: uptimeIncidents.acknowledgedAt,
        });

      return reply.send({
        success: true,
        incident: updated,
      });
    },
  });

  // Resolve incident
  server.route({
    method: "PATCH",
    url: "/api/uptime/incidents/:id/resolve",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const params = incidentIdParamsSchema.parse(request.params);
      const { id } = params;

      // Get user's organizations
      const userOrgs = await db
        .select({ organizationId: member.organizationId })
        .from(member)
        .where(eq(member.userId, userId));

      if (userOrgs.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const organizationIds = userOrgs.map((org) => org.organizationId);

      // Verify incident belongs to user's organization
      const incident = await db
        .select()
        .from(uptimeIncidents)
        .where(and(eq(uptimeIncidents.id, id), inArray(uptimeIncidents.organizationId, organizationIds)))
        .limit(1);

      if (!incident[0]) {
        return reply.code(404).send({ error: "Incident not found" });
      }

      if (incident[0].status === "resolved") {
        return reply.code(400).send({ error: "Incident already resolved" });
      }

      // Update incident
      const now = new Date().toISOString();
      const [updated] = await db
        .update(uptimeIncidents)
        .set({
          status: "resolved",
          resolvedBy: userId,
          resolvedAt: now,
          endTime: now,
          updatedAt: now,
        })
        .where(eq(uptimeIncidents.id, id))
        .returning({
          id: uptimeIncidents.id,
          status: uptimeIncidents.status,
          resolvedBy: uptimeIncidents.resolvedBy,
          resolvedAt: uptimeIncidents.resolvedAt,
          endTime: uptimeIncidents.endTime,
        });

      return reply.send({
        success: true,
        incident: updated,
      });
    },
  });
};

