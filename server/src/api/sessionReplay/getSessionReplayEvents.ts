import { FastifyReply, FastifyRequest } from "fastify";
import { SessionReplayService } from "../../services/sessionReplayService.js";

export async function getSessionReplayEvents(
  request: FastifyRequest<{
    Params: { site: string; sessionId: string };
  }>,
  reply: FastifyReply
) {
  try {
    const siteId = Number(request.params.site);
    const { sessionId } = request.params;

    console.log("Getting session replay events for:", { siteId, sessionId });

    const sessionReplayService = new SessionReplayService();
    const replayData = await sessionReplayService.getSessionReplayEvents(
      siteId,
      sessionId
    );

    console.log("Reply data metadata sample:", Object.keys(replayData.metadata));

    return reply.send(replayData);
  } catch (error) {
    console.error("Error fetching session replay events:", error);
    if (error instanceof Error && error.message === "Session replay not found") {
      return reply.status(404).send({ error: "Session replay not found" });
    }
    return reply.status(500).send({ error: "Internal server error" });
  }
}