import fs from "fs";
import { parseStream } from "@fast-csv/parse";
import boss from "../lib/boss.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE } from "../types/import.js";
import { Job } from "pg-boss";
import { UmamiEvent, umamiHeaders } from "./mappings/umami.js";
import { ImportStatusManager } from "../lib/importStatus.js";
import { ImportRateLimiter } from "../lib/rateLimiter.js";

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    try {
      const { site, importId, source, tempFilePath, organization } = job.data;

      const importableEvents = await ImportRateLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        console.log(`No more events can be imported for importId: ${importId}.`);
        await fs.promises.unlink(tempFilePath);
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
        return;
      }

      const chunkSize = 1000;
      const maxChunks = Math.ceil(importableEvents / chunkSize);
      let chunkNumber = 0;
      let chunk: UmamiEvent[] = [];
      let shouldStop = false;

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

      const cleanup = async (reason: string, error?: unknown) => {
        console.log(`Stopping CSV processing for ${importId}: ${reason}`);
        shouldStop = true;

        if (!stream.destroyed) {
          stream.destroy();
        }

        try {
          await fs.promises.unlink(tempFilePath);
          console.log(`Deleted temporary file: ${tempFilePath}`);
        } catch (error) {
          console.error(`Failed to delete file ${tempFilePath}:`, error);
        }
      };

      await ImportStatusManager.updateStatus(importId, "processing");

      parseStream(stream, { headers: true, maxRows: importableEvents })
        .on("headers", async (headers) => {
          if (!validHeaders(headers)) {
            await cleanup("Header validation failed");
            await ImportStatusManager.updateStatus(importId, "failed", `Invalid ${source} headers`);
            return;
          }
        })
        .on("data", async (row) => {
          if (shouldStop) {
            return;
          }

          // TODO: Validate data and skip invalid rows
          chunk.push(row);

          if (chunk.length >= chunkSize) {
            chunkNumber++;

            if (chunkNumber > maxChunks) {
              await cleanup(`Maximum import limit reached`);
              await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
              return;
            }

            try {
              await boss.send(DATA_INSERT_QUEUE, {
                site,
                importId,
                source,
                chunk,
                chunkNumber,
                finalChunk: chunkNumber === maxChunks,
              });
            } catch (error) {
              await cleanup("Error processing chunk");
              await ImportStatusManager.updateStatus(importId, "failed", "Error processing chunk");
              return;
            }

            chunk = [];
          }
        })
        .on("end", async (rowCount: number) => {
          try {
            if (!shouldStop && chunk.length > 0) {
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

            try {
              await fs.promises.unlink(tempFilePath);
              console.log(`Deleted temporary file: ${tempFilePath}`);
            } catch (error) {
              console.error(`Failed to delete file ${tempFilePath}:`, error);
            }
          } catch (error) {
            console.error("Error during final CSV chunk processing:", error);
            await cleanup("Error during final chunk processing");
            await ImportStatusManager.updateStatus(importId, "failed", "Error during final chunk");
          }
        })
        .on("error", async (error) => {
          console.error("CSV parsing error:", error);
          await cleanup("CSV parsing error occurred");
          await ImportStatusManager.updateStatus(importId, "failed", "CSV parsing error occurred");
        });
    } catch (error) {
      console.error("Error in CSV parse worker:", error);
      // cleanup, throw, and mark as failed
    }
  });
}
