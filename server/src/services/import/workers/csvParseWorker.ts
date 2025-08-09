import { access, constants } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { parse } from "@fast-csv/parse";
import { DateTime } from "luxon";
import { Job } from "pg-boss";
import boss from "../../../db/postgres/boss.js";
import { r2Storage } from "../../storage/r2StorageService.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { UmamiEvent, umamiHeaders } from "../mappings/umami.js";
import { ImportStatusManager } from "../importStatusManager.js";
import { ImportLimiter } from "../importLimiter.js";
import { deleteImportFile } from "../utils.js";

const getImportDataHeaders = (source: string) => {
  switch (source) {
    case "umami":
      return umamiHeaders;
    default:
      throw new Error(`Unsupported import source: ${source}`);
  }
};

const createR2FileStream = async (storageLocation: string, source: string) => {
  console.log(`[CSV Parser] Reading from R2: ${storageLocation}`);
  const fileStream = await r2Storage.getImportFileStream(storageLocation);
  return fileStream.pipe(parse({
    headers: getImportDataHeaders(source),
    renameHeaders: true,
    ignoreEmpty: true,
  }));
};

const createLocalFileStream = async (storageLocation: string, source: string) => {
  console.log(`[CSV Parser] Reading from local disk: ${storageLocation}`);
  await access(storageLocation, constants.F_OK | constants.R_OK);
  return createReadStream(storageLocation).pipe(parse({
    headers: getImportDataHeaders(source),
    renameHeaders: true,
    ignoreEmpty: true,
  }));
};

const isDateInRange = (dateStr: string, startDate?: string, endDate?: string) => {
  const createdAt = DateTime.fromFormat(dateStr, "yyyy-MM-dd HH:mm:ss", { zone: "utc" });
  if (!createdAt.isValid) {
    return false;
  }

  if (startDate) {
    const start = DateTime.fromFormat(startDate, "yyyy-MM-dd", { zone: "utc" });
    if (!start.isValid || createdAt < start.startOf("day")) {
      return false;
    }
  }

  if (endDate) {
    const end = DateTime.fromFormat(endDate, "yyyy-MM-dd", { zone: "utc" });
    if (!end.isValid || createdAt > end.endOf("day")) {
      return false;
    }
  }

  return true;
}

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    const { site, importId, source, storageLocation, isR2Storage, organization, startDate, endDate } = job.data;

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
        await deleteImportFile(storageLocation, isR2Storage);
        return;
      }

      const chunkSize = 5000;
      let chunk: UmamiEvent[] = [];
      let rowsProcessed = 0;

      const stream = isR2Storage
        ? await createR2FileStream(storageLocation, source)
        : await createLocalFileStream(storageLocation, source);

      await ImportStatusManager.updateStatus(importId, "processing");

      for await (const data of stream) {
        if (!data.created_at || !isDateInRange(data.created_at, startDate, endDate)) {
          continue;
        }

        if (rowsProcessed >= importableEvents) {
          break;
        }

        chunk.push(data);
        rowsProcessed++;

        if (chunk.length >= chunkSize) {
          await boss.send(DATA_INSERT_QUEUE, {
            site,
            importId,
            source,
            chunk,
            allChunksSent: false,
          });
          chunk = [];
        }
      }

      if (chunk.length > 0) {
        await boss.send(DATA_INSERT_QUEUE, {
          site,
          importId,
          source,
          chunk,
          allChunksSent: false,
        });
      }

      await boss.send(DATA_INSERT_QUEUE, {
        site,
        importId,
        source,
        chunk: [],
        allChunksSent: true,
      });
    } catch (error) {
      console.error("Error in CSV parse worker:", error);
      await ImportStatusManager.updateStatus(
        importId,
        "failed",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      throw error;
    } finally {
      await deleteImportFile(storageLocation, isR2Storage);
    }
  });
}
