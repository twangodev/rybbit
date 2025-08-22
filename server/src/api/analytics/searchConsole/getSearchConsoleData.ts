import { FastifyReply, FastifyRequest } from "fastify";
import { getUserHasAccessToSitePublic } from "../../../lib/auth-utils.js";
import { searchConsoleService } from "../../../services/searchConsoleService.js";
import { FilterParams } from "@rybbit/shared";

// Types for the response
interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export async function getSearchConsoleData(
  request: FastifyRequest<{
    Params: {
      site: string;
    };
    Querystring: FilterParams;
  }>,
  reply: FastifyReply
) {
  const { site } = request.params;
  const {
    startDate,
    endDate,
  } = request.query;

  // Check user access to site
  const userHasAccessToSite = await getUserHasAccessToSitePublic(request, site);
  if (!userHasAccessToSite) {
    return reply.status(403).send({ error: "Forbidden" });
  }

  try {
    // Convert site parameter to number (it's the site ID)
    const siteId = parseInt(site, 10);
    if (isNaN(siteId)) {
      return reply.status(400).send({ error: "Invalid site ID" });
    }

    // Use default date range if not provided
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days ago
    const end = endDate || new Date().toISOString().split('T')[0]; // today

    // Get search console data using the service
    const searchConsoleData = await searchConsoleService.getSearchConsoleData(siteId, start, end);

    return reply.send(searchConsoleData);
  } catch (error) {
    console.error("Error fetching search console data:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('not verified')) {
        return reply.status(400).send({ 
          error: "Site not verified in Google Search Console",
          details: error.message 
        });
      } else if (error.message.includes('not connected')) {
        return reply.status(400).send({ 
          error: "Google Search Console not connected",
          details: error.message 
        });
      } else if (error.message.includes('Access denied')) {
        return reply.status(403).send({ 
          error: "Access denied to Google Search Console",
          details: error.message 
        });
      }
    }
    
    return reply.status(500).send({ 
      error: "Failed to fetch search console data",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
