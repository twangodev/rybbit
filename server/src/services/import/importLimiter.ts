import { IS_CLOUD } from "../../lib/const.js";
import { db } from "../../db/postgres/postgres.js";
import { and, count, eq, inArray, isNotNull, sum } from "drizzle-orm";
import { importStatus } from "../../db/postgres/schema.js";

export class ImportLimiter {
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
