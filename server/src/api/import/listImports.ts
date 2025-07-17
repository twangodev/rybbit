import { FastifyReply, FastifyRequest } from "fastify";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { ImportStatusManager } from "../../lib/importStatus.js";
import { z } from "zod";

const listImportsRequestSchema = z.object({
  params: z.object({
    organization: z.string(),
    site: z.string().min(1),
  }),
}).strict();

type ListImportsRequest = {
  Params: z.infer<typeof listImportsRequestSchema.shape.params>;
};

export async function listImports(
  request: FastifyRequest<ListImportsRequest>,
  reply: FastifyReply,
) {
  try {
    const parsed = listImportsRequestSchema.safeParse({
      params: request.params,
      body: request.body,
    });

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { organization, site } = parsed.data.params;

    const userHasAccess = await getUserHasAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const imports = await ImportStatusManager.getImportsForSite(Number(site));

    return reply.send({
      imports: imports.map(imp => ({
        importId: imp.importId,
        status: imp.status,
        source: imp.source,
        fileName: imp.fileName,
        processedRows: imp.processedRows,
        totalRows: imp.totalRows,
        startedAt: imp.startedAt,
        completedAt: imp.completedAt,
        createdBy: imp.createdBy,
      }))
    });
  } catch (error) {
    console.error("Error listing imports:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
