import { FastifyRequest, FastifyReply } from "fastify";
import { siteConfig } from "../../lib/siteConfig.js";

export async function getSiteIsPublic(request: FastifyRequest<{ Params: { site: string } }>, reply: FastifyReply) {
  const { site } = request.params;
  const isPublic = await siteConfig.isSitePublic(site);
  return reply.status(200).send({ isPublic });
}
