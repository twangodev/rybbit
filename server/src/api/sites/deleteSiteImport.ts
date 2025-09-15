import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { ImportStatusManager } from "../../services/import/importStatusManager.js";
import { deleteImportFile } from "../../services/import/utils.js";
import { IS_CLOUD } from "../../lib/const.js";
import { r2Storage } from "../../services/storage/r2StorageService.js";

const deleteImportRequestSchema = z.object({
  params: z.object({
    site: z.string().min(1),
    importId: z.string().min(1),
  }),
}).strict();

type DeleteImportRequest = {
  Params: z.infer<typeof deleteImportRequestSchema.shape.params>;
};

export async function deleteSiteImport(
  request: FastifyRequest<DeleteImportRequest>,
  reply: FastifyReply,
) {
  try {
    const parsed = deleteImportRequestSchema.safeParse({
      params: request.params,
    });

    if (!parsed.success) {
      return reply.status(400).send({ error: "Validation error" });
    }

    const { site, importId } = parsed.data.params;

    const userHasAccess = await getUserHasAdminAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    // Get the import to verify it exists and belongs to this site
    const importRecord = await ImportStatusManager.getImportById(importId);
    if (!importRecord) {
      return reply.status(404).send({ error: "Import not found" });
    }

    // Verify the import belongs to this site
    if (importRecord.siteId !== Number(site)) {
      return reply.status(403).send({ error: "Import does not belong to this site" });
    }

    // Don't allow deletion of active imports
    if (importRecord.status === "pending" || importRecord.status === "processing") {
      return reply.status(400).send({ error: "Cannot delete active import" });
    }

    // Delete the import file if it exists
    try {
      // For completed/failed imports, try to delete the file
      // We construct the storage location based on whether it's R2 or local
      let storageLocation: string;
      if (IS_CLOUD && r2Storage.isEnabled()) {
        storageLocation = `imports/${importId}/${importRecord.fileName}`;
      } else {
        storageLocation = `/tmp/imports/${importId}.csv`;
      }

      await deleteImportFile(storageLocation, IS_CLOUD && r2Storage.isEnabled());
    } catch (fileError) {
      // Log the error but don't fail the deletion - the file might not exist
      console.warn(`Failed to delete import file for ${importId}:`, fileError);
    }

    // Delete the import record from the database
    await ImportStatusManager.deleteImport(importId);

    return reply.send({
      data: {
        message: "Import deleted successfully"
      }
    });
  } catch (error) {
    console.error("Error deleting import:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}
