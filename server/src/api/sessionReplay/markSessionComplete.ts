import { FastifyReply, FastifyRequest } from "fastify";
import { SessionReplayIngestService } from "../../services/sessionReplayIngestService.js";

export async function markSessionComplete(
  request: FastifyRequest<{
    Params: { site: string; sessionId: string };
  }>,
  reply: FastifyReply
) {
  try {
    const siteId = Number(request.params.site);
    const { sessionId } = request.params;

    const sessionReplayService = new SessionReplayIngestService();
    await sessionReplayService.markSessionComplete(siteId, sessionId);

    return reply.send({ success: true });
  } catch (error) {
    console.error("Error marking session as complete:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}