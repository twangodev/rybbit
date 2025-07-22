import { and, eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";

interface UpdateMonitorRequest {
  Params: {
    monitorId: string;
  };
  Body: Partial<{
    name: string;
    intervalSeconds: number;
    enabled: boolean;
    httpConfig: {
      url: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
      headers?: Record<string, string>;
      body?: string;
      auth?: {
        type: "none" | "basic" | "bearer" | "api_key" | "custom_header";
        credentials?: {
          username?: string;
          password?: string;
          token?: string;
          headerName?: string;
          headerValue?: string;
        };
      };
      followRedirects?: boolean;
      timeoutMs?: number;
      ipVersion?: "any" | "ipv4" | "ipv6";
    };
    tcpConfig: {
      host: string;
      port: number;
      timeoutMs?: number;
    };
    validationRules: Array<any>;
    regions: string[];
  }>;
}

export async function updateMonitor(
  request: FastifyRequest<UpdateMonitorRequest>,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;
  const { monitorId } = request.params;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  try {
    // First get the monitor to check if it exists and user has access
    const existingMonitor = await db.query.uptimeMonitors.findFirst({
      where: eq(uptimeMonitors.id, Number(monitorId)),
    });

    if (!existingMonitor) {
      return reply.status(404).send({ error: "Monitor not found" });
    }

    // Check if user has access to the monitor's organization
    const userHasAccess = await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, existingMonitor.organizationId)
      ),
    });

    if (!userHasAccess) {
      return reply.status(403).send({ error: "Access denied" });
    }

    const updateData = request.body;

    // Validate interval if provided
    if (updateData.intervalSeconds !== undefined) {
      if (updateData.intervalSeconds < 1 || updateData.intervalSeconds > 86400) {
        return reply.status(400).send({ error: "Interval must be between 1 and 86400 seconds" });
      }
    }

    // Validate monitor type specific config
    if (existingMonitor.monitorType === "http" && updateData.httpConfig && !updateData.httpConfig.url) {
      return reply.status(400).send({ error: "HTTP monitor requires URL" });
    }
    if (existingMonitor.monitorType === "tcp" && updateData.tcpConfig) {
      if (!updateData.tcpConfig.host || !updateData.tcpConfig.port) {
        return reply.status(400).send({ error: "TCP monitor requires host and port" });
      }
    }

    // Update the monitor
    const [updatedMonitor] = await db
      .update(uptimeMonitors)
      .set({
        ...updateData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(uptimeMonitors.id, Number(monitorId)))
      .returning();

    return reply.status(200).send(updatedMonitor);
  } catch (error) {
    console.error("Error updating monitor:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}