import { google } from 'googleapis';
import { db } from '../db/postgres/postgres.js';
import { sites } from '../db/postgres/schema.js';
import { eq } from 'drizzle-orm';

export class GoogleOAuthService {
  private static instance: GoogleOAuthService;
  private oauth2Client: any;

  private constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      (process.env.BASE_URL || 'http://localhost:3001') + '/api/search-console/oauth/callback'
    );
  }

  public static getInstance(): GoogleOAuthService {
    if (!GoogleOAuthService.instance) {
      GoogleOAuthService.instance = new GoogleOAuthService();
    }
    return GoogleOAuthService.instance;
  }

  generateAuthUrl(siteId: number): string {
    const scopes = [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: siteId.toString(), // Pass siteId in state parameter
    });
  }

  async handleCallback(code: string, state: string): Promise<{ success: boolean; error?: string }> {
    try {
      const siteId = parseInt(state, 10);
      if (isNaN(siteId)) {
        return { success: false, error: 'Invalid site ID' };
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token) {
        return { success: false, error: 'Failed to get access token' };
      }

      // Store tokens in database
      await db
        .update(sites)
        .set({
          searchConsoleAccessToken: tokens.access_token,
          searchConsoleRefreshToken: tokens.refresh_token,
          searchConsoleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        })
        .where(eq(sites.siteId, siteId));

      return { success: true };
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      return { success: false, error: 'Failed to complete OAuth flow' };
    }
  }

  async getValidAccessToken(siteId: number): Promise<string | null> {
    try {
      // Get tokens from database
      const site = await db
        .select({
          searchConsoleAccessToken: sites.searchConsoleAccessToken,
          searchConsoleRefreshToken: sites.searchConsoleRefreshToken,
          searchConsoleTokenExpiry: sites.searchConsoleTokenExpiry,
        })
        .from(sites)
        .where(eq(sites.siteId, siteId))
        .limit(1);

      if (!site[0]?.searchConsoleAccessToken) {
        return null;
      }

      const now = new Date();
      const expiry = site[0].searchConsoleTokenExpiry;

      // Check if token is expired or will expire soon (within 5 minutes)
      if (expiry && now.getTime() > expiry.getTime() - 5 * 60 * 1000) {
        // Token is expired or will expire soon, refresh it
        if (site[0].searchConsoleRefreshToken) {
          this.oauth2Client.setCredentials({
            refresh_token: site[0].searchConsoleRefreshToken,
          });

          const { credentials } = await this.oauth2Client.refreshAccessToken();
          
          // Update tokens in database
          await db
            .update(sites)
            .set({
              searchConsoleAccessToken: credentials.access_token,
              searchConsoleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
            })
            .where(eq(sites.siteId, siteId));

          return credentials.access_token;
        } else {
          // No refresh token, need to re-authenticate
          return null;
        }
      }

      return site[0].searchConsoleAccessToken;
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  }

  async disconnect(siteId: number): Promise<void> {
    try {
      await db
        .update(sites)
        .set({
          searchConsoleAccessToken: null,
          searchConsoleRefreshToken: null,
          searchConsoleTokenExpiry: null,
        })
        .where(eq(sites.siteId, siteId));
    } catch (error) {
      console.error('Error disconnecting Search Console:', error);
      throw error;
    }
  }

  async isConnected(siteId: number): Promise<boolean> {
    try {
      const accessToken = await this.getValidAccessToken(siteId);
      return !!accessToken;
    } catch (error) {
      return false;
    }
  }
}

export const googleOAuthService = GoogleOAuthService.getInstance();
