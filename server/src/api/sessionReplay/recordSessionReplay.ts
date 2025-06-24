import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { SessionReplayService } from "../../services/sessionReplayService.js";
import { RecordSessionReplayRequest } from "../../types/sessionReplay.js";

const recordSessionReplaySchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  events: z.array(
    z.object({
      type: z.string(),
      data: z.any(),
      timestamp: z.number(),
    })
  ),
  metadata: z
    .object({
      pageUrl: z.string(),
      viewportWidth: z.number().optional(),
      viewportHeight: z.number().optional(),
    })
    .optional(),
});

export async function recordSessionReplay(
  request: FastifyRequest<{
    Params: { site: string };
    Body: RecordSessionReplayRequest;
  }>,
  reply: FastifyReply
) {
  try {
    const siteId = Number(request.params.site);
    const body = recordSessionReplaySchema.parse(request.body) as RecordSessionReplayRequest;

    const sessionReplayService = new SessionReplayService();
    await sessionReplayService.recordEvents(siteId, body);

    return reply.send({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ error: error.errors });
    }
    console.error("Error recording session replay:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}