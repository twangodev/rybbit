import boss from "../../../db/postgres/boss.js";
import { UmamiEvent, UmamiImportMapper } from "../mappings/umami.js";
import { DataInsertJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { clickhouse } from "../../../db/clickhouse/clickhouse.js";
import { Job } from "pg-boss";
import { ImportStatusManager } from "../importStatusManager.js";

export async function registerDataInsertWorker() {
  await boss.work(DATA_INSERT_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<DataInsertJob<UmamiEvent>>[]) => {
    const { site, importId, source, chunk, chunkNumber, finalChunk } = job.data;

    try {
      const getImportDataMapping = (source: string) => {
        switch (source) {
          case "umami":
            return new UmamiImportMapper();
          default:
            throw new Error(`Unsupported import source: ${source}`);
        }
      }

      const dataMapper = getImportDataMapping(source);
      const transformedRecords = dataMapper.transform(chunk, site, importId);

      await clickhouse.insert({
        table: "events",
        values: transformedRecords,
        format: "JSONEachRow",
      });

      console.log(`Successfully processed chunk ${chunkNumber} for import ${importId} (${transformedRecords.length} records)`);

      await ImportStatusManager.updateProgress(
        importId,
        transformedRecords.length
      );

      if (finalChunk) {
        await ImportStatusManager.updateStatus(importId, "completed");
      }
    } catch (error) {
      console.error("Error in data insert worker:", error);
      await ImportStatusManager.updateStatus(importId, "failed", "Error inserting chunk");
      // throw error;
    }
  });
}
