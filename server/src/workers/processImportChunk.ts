import boss from "../lib/boss.js";
import { UmamiEvent, UmamiImportMapper } from "./mappings/umami.js";
import { ProcessImportChunkJob, processImportChunkQueue } from "../types/import.js";
import { clickhouse } from "../db/clickhouse/clickhouse.js";
import { Job } from "pg-boss";

await boss.work(processImportChunkQueue, async (job: Job<ProcessImportChunkJob<UmamiEvent>>[]) => {
  const { site, importId, source, chunk, chunkNumber } = job[0].data;

  const dataMapper = getImportDataMapping(source);
  const transformedRecords = dataMapper.transform(chunk, site, importId);

  await clickhouse.insert({
    table: "events",
    values: transformedRecords,
    format: "JSONEachRow",
  });

  console.log(`📦 Processed chunk ${chunkNumber} for import ${importId}`);
});

function getImportDataMapping(source: string) {
  switch (source) {
    case "umami":
      return new UmamiImportMapper();
    default:
      throw new Error(`Unsupported import source: ${source}`);
  }
}
