import { db } from "../db/postgres/postgres.js";
import { eq, and, desc } from "drizzle-orm";
import { importStatus } from "../db/postgres/schema.js";

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
    const completedAt = status === "completed" || status === "failed" ? new Date() : null;

    await db.update(importStatus)
      .set({ status, errorMessage, completedAt })
      .where(eq(importStatus.importId, importId));
  }

  static async updateProgress(
    importId: string,
    chunksCompleted: number,
    processedRows: number,
    totalChunks?: number,
    totalRows?: number
  ): Promise<void> {
    const updateData: Partial<InsertImportStatus> = {
      chunksCompleted,
      processedRows,
    };

    if (totalChunks !== undefined) {
      updateData.totalChunks = totalChunks;
    }
    if (totalRows !== undefined) {
      updateData.totalRows = totalRows;
    }

    await db.update(importStatus)
      .set(updateData)
      .where(eq(importStatus.importId, importId));
  }

  static async getImportStatus(importId: string): Promise<SelectImportStatus | null> {
    const result = await db.query.importStatus.findFirst({
      where: eq(importStatus.importId, importId),
    });
    return result || null;
  }

  static async getImportsForSite(siteId: number, limit = 50): Promise<SelectImportStatus[]> {
    return db.query.importStatus.findMany({
      where: eq(importStatus.siteId, siteId),
      orderBy: [desc(importStatus.startedAt)],
      limit,
    });
  }
}
