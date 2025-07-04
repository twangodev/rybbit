import { FastifyRequest, FastifyReply } from "fastify";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";
import fs from "fs/promises";
import path from "path";
import boss from "../../lib/boss.js";

type Platform = "umami";

interface ImportUmamiRequest {
  Params: {
    site: string;
  };
  Body: {
    platform: Platform;
  }
}

const IMPORT_DIR = "/tmp/imports";

export async function importUmami(request: FastifyRequest<ImportUmamiRequest>, reply: FastifyReply) {
  const { site } = request.params;
  const { platform } = request.body;

  const userHasAccess = await getUserHasAccessToSite(request, site);
  if (!userHasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const data = await request.file();
  if (!data) {
    return reply.status(400).send({ error: "No file uploaded." });
  }

  if (!data.filename.endsWith(".csv")) {
    return reply.status(400).send({ error: "Invalid file type. Only .csv files are accepted." });
  }

  const batchId = crypto.randomUUID();
  const tempFilePath = path.join(IMPORT_DIR, `${batchId}-${data.filename}`);

  try {
    // Ensure the import directory exists
    await fs.mkdir(IMPORT_DIR, { recursive: true });

    // Stream the file directly to the disk. This is memory efficient.
    await pipeline(data.file, createWriteStream(tempFilePath));
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    return reply.status(500).send({ error: "Failed to process uploaded file." });
  }

  // 4. Queue the Initiation Job
  // We only send the file's location, not its content.
  await boss.send("import-initiation", {
    filePath: tempFilePath,
    platform: platform,
    siteId: site,
    batchId,
  });

  reply.status(202).send({
    success: true,
    message: "Import accepted and is now being processed.",
    batchId,
  });
}
