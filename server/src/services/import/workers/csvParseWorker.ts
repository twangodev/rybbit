import fs from "fs";
import { parseStream } from "@fast-csv/parse";
import boss from "../../../db/postgres/boss.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { Job } from "pg-boss";
import { UmamiEvent, umamiHeaders } from "../mappings/umami.js";
import { ImportStatusManager } from "../importStatusManager.js";
import { ImportLimiter } from "../importLimiter.js";

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    const { site, importId, source, tempFilePath, organization } = job.data;

    const cleanup = async () => {
      try {
        await fs.promises.unlink(tempFilePath);
        console.log(`Deleted temporary file: ${tempFilePath}`);
      } catch (error) {
        console.error(`Failed to delete file ${tempFilePath}:`, error);
      }
    };

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
        await cleanup();
        return;
      }

      const chunkSize = 1000;
      let chunkNumber = 0;
      let chunk: UmamiEvent[] = [];
      let rowsProcessed = 0;

      const stream = fs.createReadStream(tempFilePath);

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

      await ImportStatusManager.updateStatus(importId, "processing");

      return new Promise<void>((resolve, reject) => {
        parseStream(stream, { headers: true, maxRows: importableEvents, discardUnmappedColumns: true, ignoreEmpty: true })
          .on("headers", (headers) => {
            if (!validHeaders(headers)) {
              reject(new Error(`Invalid ${source} headers`));
              return;
            }
          })
          .on("data", (row) => {
            if (rowsProcessed >= importableEvents) {
              stream.destroy();
              return;
            }

            chunk.push(row);
            rowsProcessed++;

            if (chunk.length >= chunkSize) {
              chunkNumber++;

              boss.send(DATA_INSERT_QUEUE, {
                site,
                importId,
                source,
                chunk: [...chunk],
                chunkNumber,
              });

              chunk = [];
            }
          })
          .on("end", async () => {
            try {
              if (chunk.length > 0) {
                chunkNumber++;
                await boss.send(DATA_INSERT_QUEUE, {
                  site,
                  importId,
                  source,
                  chunk: [...chunk],
                  chunkNumber,
                });
              }

              // Send completion job
              // await boss.send(IMPORT_COMPLETION_QUEUE, {
              //   importId,
              //   totalChunks: chunkNumber,
              //   totalRecords: rowsProcessed,
              // });

              console.log(`Queued ${chunkNumber} chunks and completion job for import ${importId}`);
              await cleanup();
              resolve();
            } catch (error) {
              reject(error);
            }
          })
          .on("error", (error) => {
            reject(error);
          });
      });
    } catch (error) {
      console.error("Error in CSV parse worker:", error);
      await ImportStatusManager.updateStatus(
        importId,
        "failed",
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      await cleanup();
      throw error;
    }
  });
}
