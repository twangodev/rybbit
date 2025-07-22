import fs from "fs";
import { parseStream } from "@fast-csv/parse";
import boss from "../../../db/postgres/boss.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE, IMPORT_COMPLETION_QUEUE } from "./jobs.js";
import { Job } from "pg-boss";
import { UmamiEvent, umamiHeaders } from "../mappings/umami.js";
import { ImportStatusManager } from "../importStatusManager.js";
import { ImportLimiter } from "../importLimiter.js";

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    const { site, importId, source, tempFilePath, organization } = job.data;

    const validHeaders = (headers: string[]): boolean => {
      const arraysAreEqual = (arr1: string[], arr2: string[]) => {
        return arr1.length === arr2.length &&
          arr1.every((value, index) => value === arr2[index]);
      };

      switch (source) {
        case "umami":
          return arraysAreEqual(umamiHeaders, headers);
        default:
          return false;
      }
    };

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
        await fs.promises.unlink(tempFilePath);
        return;
      }

      const chunkSize = 1000;
      let chunk: UmamiEvent[] = [];
      let rowsProcessed = 0;

      const stream = fs.createReadStream(tempFilePath);

      await ImportStatusManager.updateStatus(importId, "processing");

      const csvStream = parseStream(stream, {
        headers: true,
        maxRows: importableEvents,
        discardUnmappedColumns: true,
        ignoreEmpty: true
      });

      await new Promise<void>((resolve, reject) => {
        csvStream.once("headers", (headers) => {
          if (!validHeaders(headers)) {
            reject(new Error(`Invalid ${source} headers`));
            return;
          }
          resolve();
        });
        csvStream.once("error", reject);
      });

      for await (const data of csvStream) {
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
            chunk: [...chunk],
          });
          chunk = [];
        }
      }

      if (chunk.length > 0) {
        await boss.send(DATA_INSERT_QUEUE, {
          site,
          importId,
          source,
          chunk: [...chunk],
        });
      }

      await boss.send(IMPORT_COMPLETION_QUEUE, {
        importId,
        totalEvents: rowsProcessed,
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
      await fs.promises.unlink(tempFilePath);
    }
  });
}
