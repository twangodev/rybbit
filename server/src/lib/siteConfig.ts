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
}

class SiteConfig {
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
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      const site = await db
        .select({
          id: sites.id,
          siteId: sites.siteId,
          public: sites.public,
          saltUserIds: sites.saltUserIds,
          domain: sites.domain,
          blockBots: sites.blockBots,
          excludedIPs: sites.excludedIPs,
          apiKey: sites.apiKey,
        })
        .from(sites)
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)))
        .limit(1);

      if (!site[0]) {
        return undefined;
      }

      return {
        id: site[0].id,
        siteId: site[0].siteId,
        public: site[0].public || false,
        saltUserIds: site[0].saltUserIds || false,
        domain: site[0].domain || "",
        blockBots: site[0].blockBots === undefined ? true : site[0].blockBots,
        excludedIPs: Array.isArray(site[0].excludedIPs) ? site[0].excludedIPs : [],
        apiKey: site[0].apiKey,
      };
    } catch (error) {
      logger.error(error as Error, `Error fetching site configuration for ${siteIdOrId}`);
      return undefined;
    }
  }

  /**
   * Check if a site is public
   */
  async isSitePublic(siteIdOrId?: string | number): Promise<boolean> {
    if (!siteIdOrId) return false;
    const config = await this.getSiteByAnyId(siteIdOrId);
    return config?.public || false;
  }

  /**
   * Check if a site has user ID salting enabled
   */
  async shouldSaltUserIds(siteIdOrId?: string | number): Promise<boolean> {
    if (!siteIdOrId) return false;
    const config = await this.getSiteByAnyId(siteIdOrId);
    return config?.saltUserIds || false;
  }

  /**
   * Check if a site has bot blocking enabled
   */
  async shouldBlockBots(siteIdOrId?: string | number): Promise<boolean> {
    if (!siteIdOrId) return true; // Default to blocking bots if no site specified
    const config = await this.getSiteByAnyId(siteIdOrId);
    // Default to true if configuration is not found (safeguard)
    return config?.blockBots !== false;
  }

  /**
   * Get the domain of a site
   */
  async getSiteDomain(siteIdOrId?: string | number): Promise<string> {
    if (!siteIdOrId) return "";
    const config = await this.getSiteByAnyId(siteIdOrId);
    return config?.domain || "";
  }

  /**
   * Get the full site configuration
   */
  async getSiteConfig(siteIdOrId?: string | number): Promise<SiteConfigData | undefined> {
    if (!siteIdOrId) return undefined;
    return this.getSiteByAnyId(siteIdOrId);
  }

  /**
   * Update the public status of a site
   */
  async updateSitePublicStatus(siteIdOrId: number | string, isPublic: boolean): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ public: isPublic })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating public status for site ${siteIdOrId}`);
    }
  }

  /**
   * Update the salt user IDs setting of a site
   */
  async updateSiteSaltSetting(siteIdOrId: number | string, saltUserIds: boolean): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ saltUserIds })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating salt setting for site ${siteIdOrId}`);
    }
  }

  /**
   * Update the bot blocking setting of a site
   */
  async updateSiteBlockBotsSetting(siteIdOrId: number | string, blockBots: boolean): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ blockBots })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating block bots setting for site ${siteIdOrId}`);
    }
  }

  /**
   * Update the domain of a site
   */
  async updateSiteDomain(siteIdOrId: number | string, domain: string): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ domain })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating domain for site ${siteIdOrId}`);
    }
  }

  /**
   * Update the API key of a site
   */
  async updateSiteApiKey(siteIdOrId: number | string, apiKey: string | null): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ apiKey })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating API key for site ${siteIdOrId}`);
    }
  }

  /**
   * Get excluded IPs for a site
   */
  async getExcludedIPs(siteIdOrId?: string | number): Promise<string[]> {
    if (!siteIdOrId) return [];
    const config = await this.getSiteByAnyId(siteIdOrId);
    return config?.excludedIPs || [];
  }

  /**
   * Update the excluded IPs of a site
   */
  async updateSiteExcludedIPs(siteIdOrId: number | string, excludedIPs: string[]): Promise<void> {
    try {
      const isNumeric = this.isNumericId(siteIdOrId);

      await db
        .update(sites)
        .set({ excludedIPs })
        .where(isNumeric ? eq(sites.siteId, Number(siteIdOrId)) : eq(sites.id, String(siteIdOrId)));
    } catch (error) {
      logger.error(error as Error, `Error updating excluded IPs for site ${siteIdOrId}`);
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
    } catch (error) {
      logger.error(error as Error, `Error removing site ${siteIdOrId}`);
    }
  }

  /**
   * Check if an IP address matches any of the excluded IPs/ranges
   */
  async isIPExcluded(ipAddress: string, siteIdOrId?: string | number): Promise<boolean> {
    if (!siteIdOrId) return false; // If no site specified, don't exclude any IPs
    const excludedIPs = await this.getExcludedIPs(siteIdOrId);
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
