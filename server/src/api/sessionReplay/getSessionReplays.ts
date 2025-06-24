import { FastifyReply, FastifyRequest } from "fastify";
import { SessionReplayService } from "../../services/sessionReplayService.js";

export async function getSessionReplays(
  request: FastifyRequest<{
    Params: { site: string };
    Querystring: {
      limit?: string;
      offset?: string;
      startDate?: string;
      endDate?: string;
      userId?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const siteId = Number(request.params.site);
    const { limit, offset, startDate, endDate, userId } = request.query;

    const sessionReplayService = new SessionReplayService();
    const replays = await sessionReplayService.getSessionReplayList(siteId, {
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      userId: userId || undefined,
    });

    return reply.send({ data: replays });
  } catch (error) {
    console.error("Error fetching session replays:", error);
    return reply.status(500).send({ error: "Internal server error" });
  }
}