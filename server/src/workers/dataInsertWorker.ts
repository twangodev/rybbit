import boss from "../lib/boss.js";
import { UmamiEvent, UmamiImportMapper } from "./mappings/umami.js";
import { DataInsertJob, DATA_INSERT_QUEUE } from "../types/import.js";
import { clickhouse } from "../db/clickhouse/clickhouse.js";
import { Job } from "pg-boss";

export async function registerDataInsertWorker() {
  await boss.work(DATA_INSERT_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<DataInsertJob<UmamiEvent>>[]) => {
    try {
      const { site, importId, source, chunk, chunkNumber } = job.data;

      const dataMapper = getImportDataMapping(source);
      const transformedRecords = dataMapper.transform(chunk, site, importId);

      await clickhouse.insert({
        table: "events",
        values: transformedRecords,
        format: "JSONEachRow",
      });

      console.log(`Processed chunk ${chunkNumber} for import ${importId}`);
    } catch (error) {
      console.error("Error in processImportChunkQueue worker:", error);
    }
  });

  function getImportDataMapping(source: string) {
    switch (source) {
      case "umami":
        return new UmamiImportMapper();
      default:
        throw new Error(`Unsupported import source: ${source}`);
    }
  }
}
