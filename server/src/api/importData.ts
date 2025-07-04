import { FastifyRequest, FastifyReply } from "fastify";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";
import crypto from "crypto";
import boss from "../lib/boss.js";
import { getUserHasAccessToSite } from "../lib/auth-utils.js";

const IMPORT_DIR = "/tmp/imports";

const importRequestSchema = z.object({
  Params: z.object({
    site: z.string().min(1),
  }),
  Body: z.object({
    source: z.enum(["umami"]),
  }),
});

type ImportRequest = z.infer<typeof importRequestSchema>;

export async function importData(
  request: FastifyRequest<ImportRequest>,
  reply: FastifyReply,
) {
  const { site } = request.params;
  const { source } = request.body;

  const userHasAccess = await getUserHasAccessToSite(request, site);
  if (!userHasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const fileData = await request.file();
  if (!fileData) {
    return reply.status(400).send({ error: "No file uploaded." });
  }

  if (!fileData.filename.endsWith(".csv")) {
    return reply.status(400).send({ error: "Invalid file type. Only .csv files are accepted." });
  }

  const importId = `${source}_${crypto.randomUUID()};`
  const tempFilePath = path.join(IMPORT_DIR, importId);

  try {
    await fs.mkdir(IMPORT_DIR, { recursive: true });
    await pipeline(fileData.file, createWriteStream(tempFilePath));
  } catch (error) {
    console.error("🚨 Failed to save uploaded file to disk:", error);
    return reply.status(500).send({ error: "Could not process file upload." });
  }

  await boss.send("csv-import-initiation", {
    filePath: tempFilePath,
    siteId: Number(site),
    importId,
    source,
  });

  reply.status(202).send({
    success: true,
    message: "File upload accepted and is now being processed.",
    importId
  });
}
