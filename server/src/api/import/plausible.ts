import { FastifyRequest, FastifyReply } from "fastify";
import boss from "../../lib/boss.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";

interface ImportPlausibleRequest {
  Params: {
    site: string;
  };
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TABLES = [
    "visitors",
    "sources",
    "pages",
    "entry_pages",
    "exit_pages",
    "custom_events",
    "locations",
    "devices",
    "browsers",
    "operating_systems",
];

export async function importPlausible(request: FastifyRequest<ImportPlausibleRequest>, reply: FastifyReply) {
  const { site } = request.params;

  const userHasAccess = await getUserHasAccessToSite(request, site);
  if (!userHasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const parts = request.parts();
  const files = [];

  for await (const part of parts) {
    if (part.type === "file") {
        const chunks = [];
        let totalSize = 0;
        for await (const chunk of part.file) {
            totalSize += chunk.length;
            if (totalSize > MAX_FILE_SIZE) {
                return reply.status(400).send({ error: `File ${part.filename} is larger than the 100MB limit.` });
            }
            chunks.push(chunk);
        }
        const fileContent = Buffer.concat(chunks).toString("utf-8");
        files.push({ fileName: part.filename, fileContent });
    } else {
        // Handle other form fields if necessary
    }
  }

  if (files.length === 0 || files.length > MAX_FILES) {
    return reply.status(400).send({ error: `You can upload between 1 and ${MAX_FILES} files.` });
  }

  for (const file of files) {
    const fileNameParts = file.fileName.split("_");
    if (fileNameParts.length !== 4 || fileNameParts[0] !== "imported" || !fileNameParts[3].endsWith(".csv")) {
        return reply.status(400).send({ error: `Invalid file name format for ${file.fileName}.` });
    }

    const tableName = fileNameParts[1];
    if (!ALLOWED_TABLES.includes(tableName)) {
        return reply.status(400).send({ error: `Invalid table name in file ${file.fileName}.` });
    }
  }

  const importId = crypto.randomUUID();

  for (const file of files) {
    await boss.send("plausible-import", { ...file, site_id: Number(site), importId });
  }

  reply.send({ success: true, importId });
}
