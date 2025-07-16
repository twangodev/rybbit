import { ImportStatusManager } from "./importStatus.js";
import boss from "./boss.js";
import { CSV_PARSE_QUEUE, DATA_INSERT_QUEUE } from "../types/import.js";

export class ImportError extends Error {
  constructor(
    message: string,
    public importId: string,
    public recoverable: boolean = false,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "ImportError";
  }
}

export class ImportErrorHandler {
  static async handleError(
    error: Error,
    importId: string,
    context: "csv_parse" | "data_insert",
    job?: any
  ): Promise<void> {
    const isRecoverable = error instanceof ImportError && error.recoverable;
    const errorMessage = `${context}: ${error.message}`;

    console.error(`Import ${importId} failed:`, error);

    await ImportStatusManager.updateStatus(importId, "failed", errorMessage);

    if (isRecoverable && job) {
      await this.attemptRecovery(importId, context, job, error as ImportError);
    }

    await this.cleanupTempFiles(importId);
  }

  private static async attemptRecovery(
    importId: string,
    context: string,
    job: any,
    error: ImportError
  ): Promise<void> {
    const maxRetries = 3;
    const currentRetry = job.retrycount || 0;

    if (currentRetry < maxRetries) {
      const delay = error.retryAfter || Math.pow(2, currentRetry) * 1000; // Exponential backoff

      console.log(`Retrying import ${importId} in ${delay}ms (attempt ${currentRetry + 1}/${maxRetries})`);

      await boss.send(
        context === "csv_parse" ? CSV_PARSE_QUEUE : DATA_INSERT_QUEUE,
        job.data,
        {
          startAfter: new Date(Date.now() + delay),
          retryLimit: maxRetries - currentRetry - 1
        }
      );
    }
  }

  private static async cleanupTempFiles(importId: string): Promise<void> {
    try {
      const fs = await import("fs");
      const path = await import("path");

      const tempDir = "/tmp/imports";
      const files = await fs.promises.readdir(tempDir);

      for (const file of files) {
        if (file.includes(importId)) {
          await fs.promises.unlink(path.join(tempDir, file));
          console.log(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Error cleaning up temp files:", error);
    }
  }
}

export class ImportValidator {
  static validateFileSize(size: number): void {
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (size > maxSize) {
      throw new ImportError(
        `File size ${(size / 1024 / 1024).toFixed(1)}MB exceeds maximum of ${maxSize / 1024 / 1024}MB`,
        "",
        false
      );
    }
  }

  static validateRowCount(count: number): void {
    const maxRows = 1000000;
    if (count > maxRows) {
      throw new ImportError(
        `Row count ${count} exceeds maximum of ${maxRows}`,
        "",
        false
      );
    }
  }

  static validateDataIntegrity(row: any, rowIndex: number): void {
    if (!row.created_at || !row.session_id) {
      throw new ImportError(
        `Required fields missing at row ${rowIndex}`,
        "",
        false
      );
    }

    // Validate timestamp format
    const timestamp = new Date(row.created_at);
    if (isNaN(timestamp.getTime())) {
      throw new ImportError(
        `Invalid timestamp format at row ${rowIndex}: ${row.created_at}`,
        "",
        false
      );
    }

    // Validate timestamp is not in the future
    if (timestamp > new Date()) {
      throw new ImportError(
        `Future timestamp at row ${rowIndex}: ${row.created_at}`,
        "",
        false
      );
    }
  }
}
