import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { eq } from "drizzle-orm";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";

export async function getSearchConsoleApiKey(
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

    // Get site data
    const site = await db
      .select({
        searchConsoleApiKey: sites.searchConsoleApiKey,
      })
      .from(sites)
      .where(eq(sites.siteId, parsedSiteId))
      .limit(1);

    if (site.length === 0) {
      return reply.status(404).send({ success: false, error: "Site not found" });
    }

    return reply.send({
      success: true,
      data: {
        searchConsoleApiKey: site[0].searchConsoleApiKey,
        isConnected: !!site[0].searchConsoleApiKey,
      },
    });
  } catch (error) {
    console.error("Error getting Search Console API key:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to get Search Console API key",
    });
  }
}

