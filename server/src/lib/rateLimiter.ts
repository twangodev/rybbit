import { IS_CLOUD } from "./const.js";
import { db } from "../db/postgres/postgres.js";
import { eq, and, inArray, count, sum, isNotNull } from "drizzle-orm";
import { importStatus } from "../db/postgres/schema.js";

// In-memory rate limiter for API keys
class ApiKeyRateLimiter {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly maxRequests = 20; // 20 requests per second
  private readonly windowMs = 1000; // 1 second window

  isAllowed(apiKey: string): boolean {
    if (!IS_CLOUD) {
      return true; // No rate limiting for self-hosted
    }

    const now = Date.now();
    const existing = this.limits.get(apiKey);

    if (!existing || now >= existing.resetTime) {
      // New window or expired window
      this.limits.set(apiKey, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (existing.count >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment counter
    existing.count++;
    return true;
  }

  // Clean up expired entries to prevent memory leaks
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.limits.entries()) {
      if (now >= value.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const apiKeyRateLimiter = new ApiKeyRateLimiter();

// Clean up expired entries every 5 minutes
if (IS_CLOUD) {
  setInterval(() => {
    apiKeyRateLimiter.cleanup();
  }, 5 * 60 * 1000);
}

export class ImportRateLimiter {
  private static readonly IMPORTED_EVENTS_LIMIT = 1_000_000;
  private static readonly CONCURRENT_LIMIT = 1;

  static async checkConcurrentImportLimit(organizationId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    if (!IS_CLOUD) {
      return { allowed: true };
    }

    const [concurrentCountResult] = await db
      .select({ count: count() })
      .from(importStatus)
      .where(
        and(
          eq(importStatus.organizationId, organizationId),
          inArray(importStatus.status, ["pending", "processing"])
        )
      );

    if (concurrentCountResult.count >= this.CONCURRENT_LIMIT) {
      return {
        allowed: false,
        reason: `Only ${this.CONCURRENT_LIMIT} concurrent import allowed per organization.`,
      };
    }

    return { allowed: true };
  }

  static async countImportableEvents(organizationId: string): Promise<number> {
    if (!IS_CLOUD) {
      return Infinity;
    }

    const [importedEvents] = await db
      .select({ total: sum(importStatus.importedEvents) })
      .from(importStatus)
      .where(
        and(
          eq(importStatus.organizationId, organizationId),
          isNotNull(importStatus.importedEvents)
        )
      );

    return this.IMPORTED_EVENTS_LIMIT - Number(importedEvents.total ?? 0);
  }
}
