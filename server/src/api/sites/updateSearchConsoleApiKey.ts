import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { siteConfig } from "../../lib/siteConfig.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";

// Schema for updating Search Console API key
const updateSearchConsoleApiKeySchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
});

export async function updateSearchConsoleApiKey(
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
    const validationResult = updateSearchConsoleApiKeySchema.safeParse(request.body);
    if (!validationResult.success) {
      return reply.status(400).send({
        success: false,
        error: "Invalid request body",
        details: validationResult.error.flatten(),
      });
    }

    const { apiKey } = validationResult.data;

    // Update the site
    const updatedSite = await db
      .update(sites)
      .set({ searchConsoleApiKey: apiKey })
      .where(eq(sites.siteId, parsedSiteId))
      .returning({
        searchConsoleApiKey: sites.searchConsoleApiKey,
      });

    // Update the site config cache
    siteConfig.updateSiteSearchConsoleApiKey(parsedSiteId, apiKey);

    return reply.send({
      success: true,
      data: updatedSite[0],
    });
  } catch (error) {
    console.error("Error updating Search Console API key:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to update Search Console API key",
    });
  }
}

