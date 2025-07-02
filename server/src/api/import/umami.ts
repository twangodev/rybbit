import { FastifyRequest, FastifyReply } from "fastify";
import boss from "../../lib/boss.js";
import { getUserHasAccessToSite } from "../../lib/auth-utils.js";

interface ImportUmamiRequest {
  Params: {
    site: string;
  };
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export async function importUmami(request: FastifyRequest<ImportUmamiRequest>, reply: FastifyReply) {
  const { site } = request.params;

  const userHasAccess = await getUserHasAccessToSite(request, site);
  if (!userHasAccess) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const part = await request.file();

  if (!part) {
    return reply.status(400).send({ error: "No file uploaded." });
  }

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
  const file = { fileName: part.filename, fileContent };

  if (!file.fileName.endsWith(".csv")) {
    return reply.status(400).send({ error: `Invalid file name format for ${file.fileName}.` });
  }

  const importId = crypto.randomUUID();

  await boss.send("umami-import", { file, site_id: Number(site), importId });

  reply.send({ success: true, importId });
}
