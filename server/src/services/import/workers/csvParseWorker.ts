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

    const cleanup = async (reason: string, status: "failed" | "completed" = "failed") => {
      console.log(`Stopping CSV processing for ${importId}: ${reason}`);

      try {
        await fs.promises.unlink(tempFilePath);
        console.log(`Deleted temporary file: ${tempFilePath}`);
      } catch (error) {
        console.error(`Failed to delete file ${tempFilePath}:`, error);
      }

      if (status === "failed") {
        await ImportStatusManager.updateStatus(importId, "failed", reason);
      }
    };

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await cleanup("Event import limit reached");
        return;
      }

      const chunkSize = 1000;
      const maxChunks = Math.ceil(importableEvents / chunkSize);
      let chunkNumber = 0;
      let chunk: UmamiEvent[] = [];

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
        parseStream(stream, { headers: true, maxRows: importableEvents })
          .on("headers", async (headers) => {
            try {
              if (!validHeaders(headers)) {
                stream.destroy();
                await cleanup(`Invalid ${source} headers`);
                reject(new Error(`Invalid ${source} headers`));
                return;
              }
            } catch (error) {
              stream.destroy();
              reject(error);
            }
          })
          .on("data", async (row) => {
            try {
              // TODO: Validate data and skip invalid rows
              chunk.push(row);

              if (chunk.length >= chunkSize) {
                chunkNumber++;

                if (chunkNumber > maxChunks) {
                  stream.destroy();
                  await cleanup("Event import limit reached");
                  reject(new Error("Event import limit reached"));
                  return;
                }

                await boss.send(DATA_INSERT_QUEUE, {
                  site,
                  importId,
                  source,
                  chunk,
                  chunkNumber,
                  finalChunk: chunkNumber === maxChunks,
                });

                chunk = [];
              }
            } catch (error) {
              stream.destroy();
              reject(error);
            }
          })
          .on("end", async () => {
            try {
              // Process any remaining chunk
              if (chunk.length > 0) {
                chunkNumber++;

                await boss.send(DATA_INSERT_QUEUE, {
                  site,
                  importId,
                  source,
                  chunk,
                  chunkNumber,
                  finalChunk: true,
                });
              }

              await cleanup("Processing completed", "completed");
              resolve();
            } catch (error) {
              reject(error);
            }
          })
          .on("error", (error) => {
            stream.destroy();
            reject(error);
          });
      });
    } catch (error) {
      console.error("Error in CSV parse worker:", error);
      await cleanup(error instanceof Error ? error.message : "Unknown error occurred");
      throw error;
    }
  });
}
