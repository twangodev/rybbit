import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { siteConfig } from "../../lib/siteConfig.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import crypto from "crypto";

// Schema for updating API configuration
const updateApiConfigSchema = z.object({
  action: z.enum(["generate_api_key", "revoke_api_key"]),
});

export async function updateSiteApiConfig(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    const { siteId } = request.params as { siteId: string };
    const parsedSiteId = parseInt(siteId, 10);
    
    if (isNaN(parsedSiteId)) {
      return reply.status(400).send({ success: false, error: "Invalid site ID" });
    }

    const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
      request,
      String(parsedSiteId)
    );
    if (!userHasAdminAccessToSite) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    // Validate request body
    const validationResult = updateApiConfigSchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid request body",
        details: validationResult.error.flatten(),
      });
    }

    const { action } = validationResult.data;

    let updateData: any = {};

    switch (action) {
      case "generate_api_key":
        // Generate a secure random API key with rb_ prefix
        const apiKey = `rb_${crypto.randomBytes(16).toString('hex')}`;
        updateData.apiKey = apiKey;
        break;

      case "revoke_api_key":
        updateData.apiKey = null;
        break;

    }

    // Update the site
    const updatedSite = await db
      .update(sites)
      .set(updateData)
      .where(eq(sites.siteId, parsedSiteId))
      .returning({
        apiKey: sites.apiKey,
      });

    // Update the site config cache
    if (action === "generate_api_key" || action === "revoke_api_key") {
      siteConfig.updateSiteApiKey(parsedSiteId, updateData.apiKey);
    }

    return reply.send({
      success: true,
      data: updatedSite[0],
    });
  } catch (error) {
    console.error("Error updating site dev config:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to update site API configuration",
    });
  }
}