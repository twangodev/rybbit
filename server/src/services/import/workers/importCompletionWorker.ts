import boss from "../../../db/postgres/boss.js";
import { IMPORT_COMPLETION_QUEUE, ImportCompletionJob } from "./jobs.js";
import { Job } from "pg-boss";
import { ImportStatusManager } from "../importStatusManager.js";

export async function registerImportCompletionWorker() {
  await boss.work(IMPORT_COMPLETION_QUEUE, { batchSize: 1, pollingIntervalSeconds: 30 }, async ([ job ]: Job<ImportCompletionJob>[]) => {
    const { importId } = job.data;

    try {
      await ImportStatusManager.updateStatus(importId, "completed");
      console.log(`Import ${importId} completed`);
    } catch (error) {
      console.error(`Failed to mark import ${importId} as completed:`, error);
      await ImportStatusManager.updateStatus(importId, "failed", "Failed to complete import");
      throw error;
    }
  });
}
