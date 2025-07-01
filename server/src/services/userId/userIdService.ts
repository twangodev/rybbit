import crypto from "crypto";
import { siteConfig } from "../../lib/siteConfig.js";

class UserIdService {
  private cachedSalt: string | null = null;
  private cacheDate: string | null = null; // Store the date the salt was generated for (YYYY-MM-DD format)

  /**
   * Generates a deterministic daily salt based on a secret environment variable.
   * The salt remains the same for the entire UTC day and changes automatically
   * when the UTC date changes. Caches the salt in memory for efficiency.
   *
   * @throws {Error} If the BETTER_AUTH_SECRET environment variable is not set.
   * @returns {string} The daily salt as a hex string.
   */
  private getDailySalt(): string {
    const secretKey = process.env.BETTER_AUTH_SECRET;

    if (!secretKey) {
      console.error(
        "FATAL: BETTER_AUTH_SECRET environment variable is not set. User ID generation will be insecure or fail."
      );
      throw new Error("BETTER_AUTH_SECRET environment variable is missing.");
    }

    // Use UTC date to ensure consistency across timezones and server restarts
    const currentDate = new Date().toISOString().split("T")[0]; // Gets 'YYYY-MM-DD' in UTC

    // Check if the cached salt is still valid for the current UTC date
    if (this.cachedSalt && this.cacheDate === currentDate) {
      return this.cachedSalt;
    }

    const input = secretKey + currentDate;
    const newSalt = crypto.createHash("sha256").update(input).digest("hex");

    this.cachedSalt = newSalt;
    this.cacheDate = currentDate;
    return newSalt;
  }

  /**
   * Generate a user ID based on IP and user agent
   * If the site has salting enabled, also includes a daily rotating salt
   *
   * @param ip User's IP address
   * @param userAgent User's user agent string
   * @param siteId The site ID to check for salting configuration
   * @returns A sha256 hash to identify the user
   */
  generateUserId(
    ip: string,
    userAgent: string,
    siteId?: string | number
  ): string {
    // Only apply salt if the site has salting enabled
    if (siteId && siteConfig.shouldSaltUserIds(siteId)) {
      const dailySalt = this.getDailySalt(); // Get the salt for the current day
      return crypto
        .createHash("sha256")
        .update(ip + userAgent + dailySalt)
        .digest("hex");
    }

    // Otherwise, just hash IP and user agent
    return crypto
      .createHash("sha256")
      .update(ip + userAgent)
      .digest("hex");
  }
}

export const userIdService = new UserIdService();