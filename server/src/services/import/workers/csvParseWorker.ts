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

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    const { site, importId, source, storageLocation, isR2Storage, organization } = job.data;

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");

        if (isR2Storage) {
          await r2Storage.deleteImportFile(storageLocation);
        } else {
          await fs.promises.unlink(storageLocation);
        }
        return;
      }

      const chunkSize = 1000;
      let chunk: UmamiEvent[] = [];

      let stream: Readable;

      if (isR2Storage) {
        console.log(`[CSV Parser] Reading from R2: ${storageLocation}`);
        const fileBuffer = await r2Storage.getImportFile(storageLocation);
        stream = Readable.from(fileBuffer).pipe(parse({
          headers: umamiHeaders,
          renameHeaders: true,
          ignoreEmpty: true,
          maxRows: importableEvents,
        }));
      } else {
        console.log(`[CSV Parser] Reading from local disk: ${storageLocation}`);
        stream = fs.createReadStream(storageLocation).pipe(parse({
          headers: umamiHeaders,
          renameHeaders: true,
          ignoreEmpty: true,
          maxRows: importableEvents,
        }));
      }

      await ImportStatusManager.updateStatus(importId, "processing");

      for await (const data of stream) {
        chunk.push(data);

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
      try {
        if (isR2Storage) {
          await r2Storage.deleteImportFile(storageLocation);
          console.log(`[CSV Parser] Cleaned up R2 file: ${storageLocation}`);
        } else {
          await fs.promises.unlink(storageLocation);
          console.log(`[CSV Parser] Cleaned up local file: ${storageLocation}`);
        }
      } catch (cleanupError) {
        console.error("Error cleaning up import file:", cleanupError);
        // Don't throw here as the main processing might have succeeded
      }
    }
  });
}
