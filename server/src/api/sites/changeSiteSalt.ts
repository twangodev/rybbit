import { eq } from "drizzle-orm";
import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../db/postgres/postgres.js";
import { sites } from "../../db/postgres/schema.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { siteConfig } from "../../lib/siteConfig.js";

interface ChangeSiteSaltRequest {
  Body: {
    siteId: number;
    saltUserIds: boolean;
  };
}

export async function changeSiteSalt(request: FastifyRequest<ChangeSiteSaltRequest>, reply: FastifyReply) {
  const { siteId, saltUserIds } = request.body;

  const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(request, String(siteId));
  if (!userHasAdminAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    // Fetch site to check it exists
    const site = await db.query.sites.findFirst({
      where: eq(sites.siteId, siteId),
    });

    if (!site) {
      return reply.status(404).send({ error: "Site not found" });
    }

    // Update site salt setting
    await db
      .update(sites)
      .set({
        saltUserIds: saltUserIds,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(sites.siteId, siteId));

    // Update the site config cache
    siteConfig.updateSiteSaltSetting(siteId, saltUserIds);

    return reply.status(200).send({ success: true });
  } catch (error) {
    console.error("Error changing site salt setting:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
