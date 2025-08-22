import { FastifyRequest, FastifyReply } from "fastify";
import { searchConsoleService } from "../../services/searchConsoleService.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";

export async function addSitesFromSearchConsole(
  request: FastifyRequest<{ Params: { siteId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    const { siteId } = request.params;
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

    // Get the organization ID from the site
    const { db } = await import("../../db/postgres/postgres.js");
    const { sites } = await import("../../db/postgres/schema.js");
    const { eq } = await import("drizzle-orm");

    const site = await db
      .select({
        organizationId: sites.organizationId,
      })
      .from(sites)
      .where(eq(sites.siteId, parsedSiteId))
      .limit(1);

    if (!site[0]?.organizationId) {
      return reply.status(400).send({ success: false, error: "Site not found or no organization" });
    }

    const result = await searchConsoleService.addAllSearchConsoleSitesToOrg(site[0].organizationId);

    return reply.send({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error adding sites from Search Console:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to add sites from Search Console",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
