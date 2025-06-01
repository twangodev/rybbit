import { FastifyRequest, FastifyReply } from "fastify";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { db } from "../../db/postgres/postgres.js";
import { eq } from "drizzle-orm";
import { sites } from "../../db/postgres/schema.js";

interface GetSiteApiKeyRequest {
  Params: {
    id: number;
  };
}

export async function getSiteApiKey(
  request: FastifyRequest<GetSiteApiKeyRequest>,
  reply: FastifyReply
) {
  const { id } = request.params;

  const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
    request,
    String(id)
  );
  if (!userHasAdminAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    const site = await db.query.sites.findFirst({
      where: eq(sites.siteId, id),
    });

    if (!site) {
      return reply.status(404).send({ error: "Site not found" });
    }

    return reply.status(200).send({ apiKey: site.apiKey });
  } catch (error) {
    console.error("Error fetching site api key:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
