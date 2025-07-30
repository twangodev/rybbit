import { and, eq, inArray } from "drizzle-orm";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { db } from "../../db/postgres/postgres.js";
import { notificationChannels, uptimeMonitors, member } from "../../db/postgres/schema.js";
import { getSessionFromReq } from "../../lib/auth-utils.js";
import { isSMSConfigured } from "../../lib/twilio.js";

// Schemas
const channelTypeSchema = z.enum(["email", "discord", "slack", "sms"]);

const channelConfigSchema = z.object({
  email: z.string().email().optional(),
  webhookUrl: z.string().url().optional(),
  slackWebhookUrl: z.string().url().optional(),
  slackChannel: z.string().optional(),
  phoneNumber: z.string().optional(),
  provider: z.string().optional(),
});

const createChannelSchema = z.object({
  type: channelTypeSchema,
  name: z.string().min(1).max(100),
  config: channelConfigSchema,
  monitorIds: z.array(z.number()).nullable().optional(),
  triggerEvents: z.array(z.string()).default(["down", "recovery"]).optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).default(5).optional(),
});

const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  enabled: z.boolean().optional(),
  config: channelConfigSchema.optional(),
  monitorIds: z.array(z.number()).nullable().optional(),
  triggerEvents: z.array(z.string()).optional(),
  cooldownMinutes: z.number().int().min(0).max(1440).optional(),
});

const channelIdParamsSchema = z.object({
  id: z.coerce.number().int(),
});

// Helper to get user's organizations
async function getUserOrganizations(userId: string) {
  const userOrgs = await db
    .select({ organizationId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId));

  return userOrgs.map((org) => org.organizationId);
}

export const notificationRoutes = async (server: FastifyInstance) => {
  // Get notification configuration status
  server.route({
    method: "GET",
    url: "/api/uptime/notification-config",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      return reply.send({
        smsEnabled: isSMSConfigured(),
      });
    },
  });

  // Get all notification channels
  server.route({
    method: "GET",
    url: "/api/uptime/notification-channels",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const organizationIds = await getUserOrganizations(userId);

      if (organizationIds.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const channels = await db
        .select()
        .from(notificationChannels)
        .where(inArray(notificationChannels.organizationId, organizationIds));

      return reply.send({ channels });
    },
  });

  // Create notification channel
  server.route({
    method: "POST",
    url: "/api/uptime/notification-channels",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const organizationIds = await getUserOrganizations(userId);

      if (organizationIds.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      // For creation, use the first organization (assuming user can only create in their primary org)
      const organizationId = organizationIds[0];

      const body = createChannelSchema.parse(request.body);
      const { type, name, config, monitorIds, triggerEvents, cooldownMinutes } = body;

      // Validate config based on type
      if (type === "email" && !config.email) {
        return reply.code(400).send({ error: "Email address is required for email channel" });
      }
      if (type === "discord" && !config.webhookUrl) {
        return reply.code(400).send({ error: "Webhook URL is required for Discord channel" });
      }
      if (type === "slack" && !config.slackWebhookUrl) {
        return reply.code(400).send({ error: "Webhook URL is required for Slack channel" });
      }
      if (type === "sms" && !config.phoneNumber) {
        return reply.code(400).send({ error: "Phone number is required for SMS channel" });
      }

      const [channel] = await db
        .insert(notificationChannels)
        .values({
          organizationId,
          type,
          name,
          config,
          monitorIds: monitorIds || null,
          triggerEvents: triggerEvents || ["down", "recovery"],
          cooldownMinutes: cooldownMinutes || 5,
          createdBy: userId,
        })
        .returning();

      return reply.send(channel);
    },
  });

  // Update notification channel
  server.route({
    method: "PUT",
    url: "/api/uptime/notification-channels/:id",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const organizationIds = await getUserOrganizations(userId);

      if (organizationIds.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const params = channelIdParamsSchema.parse(request.params);
      const { id } = params;
      const updates = updateChannelSchema.parse(request.body);

      // Verify channel belongs to user's organization
      const [channel] = await db
        .select()
        .from(notificationChannels)
        .where(and(eq(notificationChannels.id, id), inArray(notificationChannels.organizationId, organizationIds)))
        .limit(1);

      if (!channel) {
        return reply.code(404).send({ error: "Channel not found" });
      }

      const [updated] = await db
        .update(notificationChannels)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(notificationChannels.id, id))
        .returning();

      return reply.send(updated);
    },
  });

  // Delete notification channel
  server.route({
    method: "DELETE",
    url: "/api/uptime/notification-channels/:id",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const organizationIds = await getUserOrganizations(userId);

      if (organizationIds.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const params = channelIdParamsSchema.parse(request.params);
      const { id } = params;

      // Verify channel belongs to user's organization
      const [channel] = await db
        .select()
        .from(notificationChannels)
        .where(and(eq(notificationChannels.id, id), inArray(notificationChannels.organizationId, organizationIds)))
        .limit(1);

      if (!channel) {
        return reply.code(404).send({ error: "Channel not found" });
      }

      // Delete the channel
      await db.delete(notificationChannels).where(eq(notificationChannels.id, id));

      return reply.send({ success: true });
    },
  });

  // Test notification channel
  server.route({
    method: "POST",
    url: "/api/uptime/notification-channels/:id/test",
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      const session = await getSessionFromReq(request);
      const userId = session?.user?.id;

      if (!userId) {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      const organizationIds = await getUserOrganizations(userId);

      if (organizationIds.length === 0) {
        return reply.status(403).send({ error: "No organization access" });
      }

      const params = channelIdParamsSchema.parse(request.params);
      const { id } = params;

      // Verify channel belongs to user's organization
      const [channel] = await db
        .select()
        .from(notificationChannels)
        .where(and(eq(notificationChannels.id, id), inArray(notificationChannels.organizationId, organizationIds)))
        .limit(1);

      if (!channel) {
        return reply.code(404).send({ error: "Channel not found" });
      }

      // TODO: Implement actual notification sending
      // For now, just return success
      return reply.send({
        success: true,
        message: `Test notification would be sent to ${channel.type} channel: ${channel.name}`,
      });
    },
  });
};
