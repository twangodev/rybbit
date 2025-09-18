import { eq, or } from "drizzle-orm";
import { db } from "../db/postgres/postgres.js";
import { sites } from "../db/postgres/schema.js";
import { logger } from "./logger/logger.js";
import { matchesCIDR, matchesRange } from "./ipUtils.js";

// Site configuration interface
interface SiteConfigData {
  id: string | null;
  siteId: number;
  public: boolean;
  saltUserIds: boolean;
  domain: string;
  blockBots: boolean;
  excludedIPs: string[];
  apiKey?: string | null;
  sessionReplay: boolean;
  webVitals: boolean;
  trackErrors: boolean;
  trackOutbound: boolean;
  trackUrlParams: boolean;
  trackInitialPageView: boolean;
  trackSpaNavigation: boolean;
}

class SiteConfig {
  private cache = new Map<string, { data: SiteConfigData; expires: number }>();
  private cacheTTL = 60 * 1000; // 1 minute TTL

  /**
   * Helper to determine if the input is a numeric siteId or string id
   */
  private isNumericId(id: string | number): boolean {
    return typeof id === "number" || /^\d+$/.test(id);
  }

  /**
   * Get site by either siteId or id
   */
  private async getSiteByAnyId(siteIdOrId: string | number): Promise<SiteConfigData | undefined> {
    const cacheKey = String(siteIdOrId);
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      const [site] = await db
        .select({
          id: sites.id,
          siteId: sites.siteId,
          public: sites.public,
          saltUserIds: sites.saltUserIds,
          domain: sites.domain,
          blockBots: sites.blockBots,
          excludedIPs: sites.excludedIPs,
          apiKey: sites.apiKey,
          sessionReplay: sites.sessionReplay,
          webVitals: sites.webVitals,
          trackErrors: sites.trackErrors,
          trackOutbound: sites.trackOutbound,
          trackUrlParams: sites.trackUrlParams,
          trackInitialPageView: sites.trackInitialPageView,
          trackSpaNavigation: sites.trackSpaNavigation,
        })
        .from(sites)
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)))
        .limit(1);

      if (!site) {
        return undefined;
      }

      const configData: SiteConfigData = {
        id: site.id,
        siteId: site.siteId,
        public: site.public || false,
        saltUserIds: site.saltUserIds || false,
        domain: site.domain || "",
        blockBots: site.blockBots === undefined ? true : site.blockBots,
        excludedIPs: Array.isArray(site.excludedIPs) ? site.excludedIPs : [],
        apiKey: site.apiKey,
        sessionReplay: site.sessionReplay || false,
        webVitals: site.webVitals || false,
        trackErrors: site.trackErrors || false,
        trackOutbound: site.trackOutbound || true,
        trackUrlParams: site.trackUrlParams || true,
        trackInitialPageView: site.trackInitialPageView || true,
        trackSpaNavigation: site.trackSpaNavigation || true,
      };

      this.cache.set(cacheKey, {
        data: configData,
        expires: Date.now() + this.cacheTTL,
      });

      return configData;
    } catch (error) {
      logger.error(error as Error, `Error fetching site configuration for ${siteIdOrId}`);
      return undefined;
    }
  }

  /**
   * Get the full site configuration
   */
  async getConfig(siteIdOrId?: string | number): Promise<SiteConfigData | undefined> {
    if (!siteIdOrId) return undefined;
    return this.getSiteByAnyId(siteIdOrId);
  }

  async updateConfig(siteIdOrId: number | string, config: Partial<SiteConfigData>): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);
      await db
        .update(sites)
        .set(config)
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));

      // Invalidate cache after update
      this.cache.delete(String(siteIdOrId));
    } catch (error) {
      logger.error(error as Error, `Error updating site configuration for ${siteIdOrId}`);
    }
  }

  /**
   * Add a new site
   */
  async addSite(config: Omit<SiteConfigData, "siteId">): Promise<void> {
    try {
      await db.insert(sites).values({
        id: config.id,
        name: "", // This would need to be provided
        domain: config.domain,
        public: config.public,
        saltUserIds: config.saltUserIds,
        blockBots: config.blockBots,
        excludedIPs: config.excludedIPs,
        apiKey: config.apiKey,
        createdBy: "", // This would need to be provided
      });
    } catch (error) {
      logger.error(error as Error, `Error adding site`);
    }
  }

  /**
   * Remove a site
   */
  async removeSite(siteIdOrId: number | string): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db.delete(sites).where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));

      // Invalidate cache after deletion
      this.cache.delete(String(siteIdOrId));
    } catch (error) {
      logger.error(error as Error, `Error removing site ${siteIdOrId}`);
    }
  }

  /**
   * Check if an IP address matches any of the excluded IPs/ranges
   */
  async isIPExcluded(ipAddress: string, siteIdOrId?: string | number): Promise<boolean> {
    if (!siteIdOrId) return false; // If no site specified, don't exclude any IPs
    const config = await this.getSiteByAnyId(siteIdOrId);
    const excludedIPs = config?.excludedIPs || [];
    if (!excludedIPs || excludedIPs.length === 0) {
      return false;
    }

    for (const excludedPattern of excludedIPs) {
      if (this.matchesIPPattern(ipAddress, excludedPattern)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if an IP address matches a specific pattern
   * Supports:
   * - Single IP: 192.168.1.1, 2001:db8::1
   * - CIDR notation: 192.168.1.0/24, 2001:db8::/32
   * - Range notation: 192.168.1.1-192.168.1.10 (IPv4 only, IPv6 ranges not supported)
   */
  private matchesIPPattern(ipAddress: string, pattern: string): boolean {
    try {
      const trimmedPattern = pattern.trim();

      // Single IP match
      if (!trimmedPattern.includes("/") && !trimmedPattern.includes("-")) {
        return ipAddress === trimmedPattern;
      }

      // CIDR notation
      if (trimmedPattern.includes("/")) {
        return matchesCIDR(ipAddress, trimmedPattern);
      }

      // Range notation
      if (trimmedPattern.includes("-")) {
        return matchesRange(ipAddress, trimmedPattern);
      }

      return false;
    } catch (error) {
      logger.warn(error as Error, `Invalid IP pattern: ${pattern}`);
      return false;
    }
  }
}

// Singleton instance
export const siteConfig = new SiteConfig();
