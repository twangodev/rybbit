import { FastifyReply, FastifyRequest } from "fastify";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { ImportStatusManager } from "../../services/import/importStatusManager.js";
import { z } from "zod";

const listSiteImportsRequestSchema = z.object({
  params: z.object({
    site: z.string().min(1),
  }),
}).strict();

type ListSiteImportsRequest = {
  Params: z.infer<typeof listSiteImportsRequestSchema.shape.params>;
};

export async function listSiteImports(
  request: FastifyRequest<ListSiteImportsRequest>,
  reply: FastifyReply,
) {
  try {
    const parsed = listSiteImportsRequestSchema.safeParse({
      params: request.params,
    });

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { site } = parsed.data.params;

    const userHasAccess = await getUserHasAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const imports = await ImportStatusManager.getImportsForSite(Number(site));

    return reply.send({
      imports: imports.map(imp => ({
        importId: imp.importId,
        source: imp.source,
        status: imp.status,
        importedEvents: imp.importedEvents,
        errorMessage: imp.errorMessage,
        startedAt: imp.startedAt, // maybe return import time, or no time data at all
        completedAt: imp.completedAt,
        fileName: imp.fileName,
      }))
    });
  } catch (error) {
    console.error("Error listing imports:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
