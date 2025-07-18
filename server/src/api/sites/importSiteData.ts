import { FastifyRequest, FastifyReply } from "fastify";
import { pipeline } from "stream/promises";
import fs from "fs";
import path from "path";
import { z } from "zod";
import crypto from "crypto";
import boss from "../../db/postgres/boss.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";
import { CSV_PARSE_QUEUE } from "../../types/import.js";
import { ImportRateLimiter } from "../../lib/rateLimiter.js";
import { ImportStatusManager } from "../../lib/importStatus.js";

const importDataRequestSchema = z.object({
  params: z.object({
    organization: z.string(),
    site: z.string().min(1),
  }),
  body: z.object({
    source: z.enum(["umami"]),
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

    const { organization, site } = parsed.data.params;
    const { source } = parsed.data.body;

    const userHasAccess = await getUserHasAdminAccessToSite(request, site);
    if (!userHasAccess) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const concurrentImportLimitResult = await ImportRateLimiter.checkConcurrentImportLimit(organization);
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

    const importDir = "/tmp/imports"; // ./tmp/imports?
    const importId = crypto.randomUUID();
    const savedFileName = `${importId}.csv`;
    const tempFilePath = path.join(importDir, savedFileName);

    await ImportStatusManager.createImportStatus({
      importId,
      siteId: Number(site),
      organizationId: organization,
      source,
      status: "pending",
      fileName: fileData.filename,
      fileSize: fileData.file.readableLength || 0,
    });

    try {
      await fs.promises.mkdir(importDir, { recursive: true });
      await pipeline(fileData.file, fs.createWriteStream(tempFilePath));
    } catch (fileError) {
      await ImportStatusManager.updateStatus(importId, "failed", "Failed to save uploaded file");
      console.error("Failed to save uploaded file to disk:", fileError);
      return reply.status(500).send({ error: "Could not process file upload." });
    }

    try {
      await boss.send(CSV_PARSE_QUEUE, {
        tempFilePath,
        organization,
        site,
        importId,
        source,
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
