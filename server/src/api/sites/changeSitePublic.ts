import { FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { eq } from "drizzle-orm";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { siteConfig } from "../../lib/siteConfig.js";

interface ChangeSitePublicRequest {
  Body: {
    siteId: number;
    isPublic: boolean;
  };
}

export async function changeSitePublic(request: FastifyRequest<ChangeSitePublicRequest>, reply: FastifyReply) {
  const { siteId, isPublic } = request.body;

  const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(request, String(siteId));
  if (!userHasAdminAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    // Fetch site to check ownership
    const site = await db.query.sites.findFirst({
      where: eq(sites.siteId, siteId),
    });

    if (!site) {
      return reply.status(404).send({ error: "Site not found" });
    }

    // Update site public status
    await db
      .update(sites)
      .set({
        public: isPublic,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(sites.siteId, siteId));

    // Update the public sites cache
    siteConfig.updateSitePublicStatus(siteId, isPublic);

    return reply.status(200).send({ success: true });
  } catch (error) {
    console.error("Error changing site public status:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
