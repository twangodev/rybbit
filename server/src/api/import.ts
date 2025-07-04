import { FastifyRequest, FastifyReply } from "fastify";
import boss from "../lib/boss.js";
import { getUserHasAccessToSite } from "../lib/auth-utils.js";
import { z } from "zod";
import crypto from "crypto";

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

  const userHasAccessToSite = await getUserHasAccessToSite(request, site);
  if (!userHasAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  const file = await request.file();
  if (!file) {
    return reply.status(400).send({ error: "No file uploaded." });
  }

  if (!file.filename.endsWith(".csv")) {
    return reply
      .status(400)
      .send({ error: "Invalid file type. Only .csv files are accepted." });
  }

  const importId = crypto.randomUUID();
  const fileBuffer = await file.toBuffer();

  await boss.send("csv-import", {
    file: {
      data: fileBuffer,
      filename: file.filename,
      mimetype: file.mimetype,
    },
    site_id: Number(site),
    importId,
    source,
  });

  reply.send({ success: true, importId });
}
