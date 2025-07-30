import fs from "fs";
import { parse } from "@fast-csv/parse";
import { Readable } from "stream";
import boss from "../../../db/postgres/boss.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { Job } from "pg-boss";
import { UmamiEvent, umamiHeaders } from "../mappings/umami.js";
import { ImportStatusManager } from "../importStatusManager.js";
import { ImportLimiter } from "../importLimiter.js";
import { r2Storage } from "../../storage/r2StorageService.js";
import { DateTime } from "luxon";
import { deleteImportFile } from "../utils.js";

const getImportDataHeaders = (source: string) => {
  switch (source) {
    case "umami":
      return umamiHeaders;
    default:
      throw new Error(`Unsupported import source: ${source}`);
  }
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

      let stream: Readable;

      if (isR2Storage) {
        console.log(`[CSV Parser] Reading from R2: ${storageLocation}`);
        const fileStream = await r2Storage.getImportFileStream(storageLocation);
        stream = fileStream.pipe(parse({
          headers: getImportDataHeaders(source),
          renameHeaders: true,
          ignoreEmpty: true,
        }));
      } else {
        console.log(`[CSV Parser] Reading from local disk: ${storageLocation}`);
        stream = fs.createReadStream(storageLocation).pipe(parse({
          headers: getImportDataHeaders(source),
          renameHeaders: true,
          ignoreEmpty: true,
        }));
      }

      await ImportStatusManager.updateStatus(importId, "processing");

      for await (const data of stream) {
        if (!data.created_at) {
          continue;
        }
        const createdAt = DateTime.fromFormat(data.created_at, "yyyy-MM-dd HH:mm:ss", { zone: "utc" });
        if (!createdAt.isValid) {
          continue;
        }

        if (startDate) {
          const start = DateTime.fromFormat(startDate, "yyyy-MM-dd", { zone: "utc" });
          if (!start.isValid || createdAt < start.startOf("day")) {
            continue;
          }
        }
        if (endDate) {
          const end = DateTime.fromFormat(endDate, "yyyy-MM-dd", { zone: "utc" });
          if (!end.isValid || createdAt > end.endOf("day")) {
            continue;
          }
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
