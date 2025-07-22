import boss from "../../../db/postgres/boss.js";
import { UmamiImportMapper } from "../mappings/umami.js";
import { DataInsertJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import { Job } from "pg-boss";
import { ImportStatusManager } from "../importStatusManager.js";

const getImportDataMapping = (source: string) => {
  switch (source) {
    case "umami":
      return UmamiImportMapper;
    default:
      throw new Error(`Unsupported import source: ${source}`);
  }
}

export async function registerDataInsertWorker() {
  await boss.work(DATA_INSERT_QUEUE, { batchSize: 1, pollingIntervalSeconds: 2 }, async ([ job ]: Job<DataInsertJob>[]) => {
    const { site, importId, source, chunk } = job.data;

    try {
      const dataMapper = getImportDataMapping(source);
      const transformedRecords = dataMapper.transform(chunk, site, importId);

      await clickhouse.insert({
        table: "events",
        values: transformedRecords,
        format: "JSONEachRow",
      });

      await ImportStatusManager.updateProgress(
        importId,
        transformedRecords.length
      );
    } catch (error) {
      console.error("Error in data insert worker:", error);
      await ImportStatusManager.updateStatus(importId, "failed", "Error inserting chunk");
      throw error;
    }
  });
}
