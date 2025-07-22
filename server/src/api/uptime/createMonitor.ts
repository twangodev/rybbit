import { and, eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { uptimeMonitors, uptimeMonitorStatus, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";

interface CreateMonitorBody {
  Body: {
    organizationId: string;
    name: string;
    monitorType: "http" | "tcp";
    intervalSeconds: number;
    enabled?: boolean;
    httpConfig?: {
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
    tcpConfig?: {
      host: string;
      port: number;
      timeoutMs?: number;
    };
    validationRules?: Array<any>;
    regions?: string[];
  };
}

export async function createMonitor(
  request: FastifyRequest<CreateMonitorBody>,
  reply: FastifyReply
) {
  const session = await getSessionFromReq(request);
  const userId = session?.user?.id;

  if (!userId) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const {
    organizationId,
    name,
    monitorType,
    intervalSeconds,
    enabled = true,
    httpConfig,
    tcpConfig,
    validationRules = [],
    regions = ["local"],
  } = request.body;

  try {
    // Validate required fields
    if (!organizationId || !name || !monitorType || !intervalSeconds) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    // Validate monitor type specific config
    if (monitorType === "http" && !httpConfig?.url) {
      return reply.status(400).send({ error: "HTTP monitor requires URL" });
    }
    if (monitorType === "tcp" && (!tcpConfig?.host || !tcpConfig?.port)) {
      return reply.status(400).send({ error: "TCP monitor requires host and port" });
    }

    // Validate interval
    if (intervalSeconds < 1 || intervalSeconds > 86400) {
      return reply.status(400).send({ error: "Interval must be between 1 and 86400 seconds" });
    }

    // Check if user has access to the organization
    const userHasAccess = await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      ),
    });

    if (!userHasAccess) {
      return reply.status(403).send({ error: "Access denied to organization" });
    }

    // Create the monitor
    const [newMonitor] = await db
      .insert(uptimeMonitors)
      .values({
        organizationId,
        name,
        monitorType,
        intervalSeconds,
        enabled,
        httpConfig: monitorType === "http" ? httpConfig : null,
        tcpConfig: monitorType === "tcp" ? tcpConfig : null,
        validationRules,
        regions,
        createdBy: userId,
      })
      .returning();

    // Initialize monitor status
    await db.insert(uptimeMonitorStatus).values({
      monitorId: newMonitor.id,
      currentStatus: "unknown",
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    });

    return reply.status(201).send(newMonitor);
  } catch (error) {
    console.error("Error creating monitor:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}