import { FastifyRequest, FastifyReply } from "fastify";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import { z } from "zod";
import crypto from "crypto";
import boss from "../../db/postgres/boss.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { CSV_PARSE_QUEUE } from "../../services/import/workers/jobs.js";
import { ImportStatusManager } from "../../services/import/importStatusManager.js";
import { ImportLimiter } from "../../services/import/importLimiter.js";
import { r2Storage } from "../../services/storage/r2StorageService.js";
import { IS_CLOUD } from "../../lib/const.js";
import { DateTime } from "luxon";

const isValidDate = (val: string) => {
  const dt = DateTime.fromFormat(val, "yyyy-MM-dd", { zone: "utc" });
  return dt.isValid;
};

const parseDate = (val: string) => DateTime.fromFormat(val, "yyyy-MM-dd", { zone: "utc" });

const importDataRequestSchema = z.object({
  params: z.object({
    site: z.string().min(1),
  }),
  body: z.object({
    source: z.enum(["umami"]),
    startDate: z.string().refine(isValidDate).optional(),
    endDate: z.string().refine(isValidDate).optional(),
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      const start = parseDate(data.startDate);
      const end = parseDate(data.endDate);
      return start <= end;
    }
    return true;
  }).refine((data) => {
    if (data.endDate) {
      const today = DateTime.utc().startOf("day");
      const end = parseDate(data.endDate);
      return end <= today;
    }
    return true;
  }),
}).strict();

type ImportDataRequest = {
  Params: z.infer<typeof importDataRequestSchema.shape.params>;
  Body: z.infer<typeof importDataRequestSchema.shape.body>;
};

export async function importSiteData(
  request: FastifyRequest<ImportDataRequest>,
  reply: FastifyReply,
) {
  try {
    const parsed = importDataRequestSchema.safeParse({
      params: request.params,
      body: request.body,
    });

    if (!parsed.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parsed.error.flatten(),
      });
    }

    const { site } = parsed.data.params;
    const { source, startDate, endDate } = parsed.data.body;

    const userHasAccess = await getUserHasAdminAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const concurrentImportLimitResult = await ImportLimiter.checkConcurrentImportLimit(Number(site));
    if (!concurrentImportLimitResult.allowed) {
      return reply.status(429).send({
        error: "Organization limit exceeded",
        message: concurrentImportLimitResult.reason,
      });
    }

    const fileData = await request.file();
    if (!fileData) {
      return reply.status(400).send({ error: "No file uploaded." });
    }

    if (fileData.file.truncated) {
      return reply.status(400).send({ error: "File too large. Max size is 100MB." });
    }

    if (fileData.mimetype !== "text/csv" || !fileData.filename.endsWith(".csv")) {
      return reply.status(400).send({
        error: "Invalid file type. Only .csv files are accepted.",
      });
    }

    const organization = concurrentImportLimitResult.organizationId;
    const importId = crypto.randomUUID();

    await ImportStatusManager.createImportStatus({
      importId,
      siteId: Number(site),
      organizationId: organization,
      source,
      status: "pending",
      fileName: fileData.filename,
      fileSize: fileData.file.readableLength || 0,
    });

    let storageLocation: string;

    try {
      if (IS_CLOUD && r2Storage.isEnabled()) {
        const r2Key = `imports/${importId}/${fileData.filename}`;

        await r2Storage.storeImportFile(r2Key, fileData.file);
        storageLocation = r2Key;

        console.log(`[Import] File streamed to R2: ${r2Key}`);
      } else {
        const importDir = "./tmp/imports";
        const savedFileName = `${importId}.csv`;
        const tempFilePath = path.join(importDir, savedFileName);

        await fs.promises.mkdir(importDir, { recursive: true });
        await pipeline(fileData.file, fs.createWriteStream(tempFilePath));
        storageLocation = tempFilePath;

        console.log(`[Import] File stored locally: ${tempFilePath}`);
      }
    } catch (fileError) {
      await ImportStatusManager.updateStatus(importId, "failed", "Failed to save uploaded file");
      console.error("Failed to save uploaded file:", fileError);
      return reply.status(500).send({ error: "Could not process file upload." });
    }

    try {
      await boss.send(CSV_PARSE_QUEUE, {
        site,
        importId,
        source,
        storageLocation,
        isR2Storage: IS_CLOUD && r2Storage.isEnabled(),
        organization,
        startDate,
        endDate,
      });
    } catch (queueError) {
      await ImportStatusManager.updateStatus(importId, "failed", "Failed to queue import job");
      console.error("Failed to enqueue import job:", queueError);
      return reply.status(500).send({ error: "Failed to initiate import process." });
    }

    return reply.status(202).send({
      success: true,
      message: "File upload accepted and is now being processed.",
      importId,
    });
  } catch (error) {
    console.error("Unexpected error during import:", error);
    return reply.status(500).send({
      error: "An unexpected error occurred. Please try again later.",
    });
  }
}
