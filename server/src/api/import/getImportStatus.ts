import { FastifyReply, FastifyRequest } from "fastify";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import { ImportStatusManager } from "../../lib/importStatus.js";
import { z } from "zod";

const getImportStatusRequestSchema = z.object({
  params: z.object({
    organization: z.string(),
    site: z.string().min(1),
  }),
  body: z.object({
    importId: z.string(),
  }),
}).strict();

type GetImportStatusRequest = {
  Params: z.infer<typeof getImportStatusRequestSchema.shape.params>;
  Body: z.infer<typeof getImportStatusRequestSchema.shape.body>;
};

export async function getImportStatus(
  request: FastifyRequest<GetImportStatusRequest>,
  reply: FastifyReply,
) {
  try {
    const { organization, site } = request.params;
    const { importId } = request.body;

    const userHasAccess = await getUserHasAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const importStatus = await ImportStatusManager.getImportStatus(importId);
    if (!importStatus) {
      return reply.status(404).send({ error: "Import not found" });
    }

    // if (importStatus.createdBy !== request.user?.id) {
    //   return reply.status(403).send({ error: "Forbidden" });
    // }

    return reply.send({
      importId: importStatus.importId,
      status: importStatus.status,
      progress: {
        totalRows: importStatus.totalRows,
        processedRows: importStatus.processedRows,
        chunksCompleted: importStatus.chunksCompleted,
        totalChunks: importStatus.totalChunks,
        percentage: importStatus.totalRows
          ? Math.round((importStatus.processedRows / importStatus.totalRows) * 100)
          : 0,
      },
      timestamps: {
        startedAt: importStatus.startedAt,
        completedAt: importStatus.completedAt,
      },
      error: importStatus.errorMessage,
      source: importStatus.source,
      fileName: importStatus.fileName,
    });
  } catch (error) {
    console.error("Error fetching import status:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
