import { FastifyRequest, FastifyReply } from "fastify";
import { googleOAuthService } from "../../services/googleOAuthService.js";
import { getUserHasAdminAccessToSite } from "../../lib/auth-utils.js";

// Generate OAuth2 authorization URL
export async function generateOAuthUrl(
  request: FastifyRequest<{ Params: { siteId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    const { siteId } = request.params;
    const parsedSiteId = parseInt(siteId, 10);
    
    if (isNaN(parsedSiteId)) {
      return reply.status(400).send({ success: false, error: "Invalid site ID" });
    }

    const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
      request,
      String(parsedSiteId)
    );
    if (!userHasAdminAccessToSite) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const authUrl = googleOAuthService.generateAuthUrl(parsedSiteId);

    return reply.send({
      success: true,
      data: { authUrl },
    });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to generate OAuth URL",
    });
  }
}

// Handle OAuth2 callback
export async function handleOAuthCallback(
  request: FastifyRequest<{ Querystring: { code?: string; state?: string; error?: string } }>,
  reply: FastifyReply
) {
  try {
    const { code, state, error } = request.query;

    if (error) {
      return reply.status(400).send({
        success: false,
        error: `OAuth error: ${error}`,
      });
    }

    if (!code || !state) {
      return reply.status(400).send({
        success: false,
        error: "Missing code or state parameter",
      });
    }

    const result = await googleOAuthService.handleCallback(code, state);

    if (result.success) {
      // Extract site ID from state parameter
      const siteId = state; // The state parameter contains the site ID
      // Redirect to frontend success page with site ID
      const frontendUrl = process.env.BASE_URL?.replace('3001', '3002') || 'http://localhost:3002';
      return reply.redirect(`${frontendUrl}/${siteId}/search-console/oauth/success`);
    } else {
      // Extract site ID from state parameter for error page
      const siteId = state; // The state parameter contains the site ID
      // Redirect to frontend error page with site ID
      const frontendUrl = process.env.BASE_URL?.replace('3001', '3002') || 'http://localhost:3002';
      return reply.redirect(`${frontendUrl}/${siteId}/search-console/oauth/error?message=${encodeURIComponent(result.error || 'Unknown error')}`);
    }
  } catch (error) {
    console.error("Error handling OAuth callback:", error);
    // Try to extract site ID from state if available
    const siteId = request.query.state || '1'; // Default to site 1 if state is not available
    const frontendUrl = process.env.BASE_URL?.replace('3001', '3002') || 'http://localhost:3002';
    return reply.redirect(`${frontendUrl}/${siteId}/search-console/oauth/error?message=${encodeURIComponent('Failed to complete OAuth flow')}`);
  }
}

// Disconnect Search Console
export async function disconnectSearchConsole(
  request: FastifyRequest<{ Params: { siteId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    const { siteId } = request.params;
    const parsedSiteId = parseInt(siteId, 10);
    
    if (isNaN(parsedSiteId)) {
      return reply.status(400).send({ success: false, error: "Invalid site ID" });
    }

    const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
      request,
      String(parsedSiteId)
    );
    if (!userHasAdminAccessToSite) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    await googleOAuthService.disconnect(parsedSiteId);

    return reply.send({
      success: true,
      message: "Search Console disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting Search Console:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to disconnect Search Console",
    });
  }
}

// Check connection status
export async function getConnectionStatus(
  request: FastifyRequest<{ Params: { siteId: string } }>,
  reply: FastifyReply
) {
  try {
    if (!request.user) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    const { siteId } = request.params;
    const parsedSiteId = parseInt(siteId, 10);
    
    if (isNaN(parsedSiteId)) {
      return reply.status(400).send({ success: false, error: "Invalid site ID" });
    }

    const userHasAdminAccessToSite = await getUserHasAdminAccessToSite(
      request,
      String(parsedSiteId)
    );
    if (!userHasAdminAccessToSite) {
      return reply.status(403).send({ error: "Forbidden" });
    }

    const isConnected = await googleOAuthService.isConnected(parsedSiteId);

    return reply.send({
      success: true,
      data: { isConnected },
    });
  } catch (error) {
    console.error("Error checking connection status:", error);
    return reply.status(500).send({
      success: false,
      error: "Failed to check connection status",
    });
  }
}
