import { db } from "../../db/postgres/postgres.js";
import { eq, desc, sql } from "drizzle-orm";
import { importStatus } from "../../db/postgres/schema.js";
import { DateTime } from "luxon";

type SelectImportStatus = typeof importStatus.$inferSelect;
type InsertImportStatus = typeof importStatus.$inferInsert;

export class ImportStatusManager {
  static async createImportStatus(data: InsertImportStatus): Promise<void> {
    await db.insert(importStatus).values(data);
  }

  static async updateStatus(
    importId: string,
    status: InsertImportStatus["status"],
    errorMessage?: string
  ): Promise<void> {
    const completedAt = status === "completed" || status === "failed" ? DateTime.utc().toISO() : null;

    await db
      .update(importStatus)
      .set({ status, errorMessage, completedAt })
      .where(eq(importStatus.importId, importId));
  }

  static async updateProgress(
    importId: string,
    importedEvents: number,
  ): Promise<void> {
    await db
      .update(importStatus)
      .set({
        importedEvents: sql`${importStatus.importedEvents} + ${importedEvents}`,
      })
      .where(eq(importStatus.importId, importId));
  }

  static async getImportsForSite(siteId: number, limit = 10): Promise<SelectImportStatus[]> {
    return db.query.importStatus.findMany({
      where: eq(importStatus.siteId, siteId),
      orderBy: [desc(importStatus.startedAt)],
      limit,
    });
  }
}
