import { FastifyReply, FastifyRequest } from "fastify";
import { SessionReplayService } from "../../services/sessionReplayService.js";

export async function markSessionComplete(
  request: FastifyRequest<{
    Params: { site: string; sessionId: string };
  }>,
  reply: FastifyReply
) {
  try {
    const siteId = Number(request.params.site);
    const { sessionId } = request.params;

    const sessionReplayService = new SessionReplayService();
    await sessionReplayService.markSessionComplete(siteId, sessionId);

    return reply.send({ success: true });
  } catch (error) {
    console.error("Error marking session as complete:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}