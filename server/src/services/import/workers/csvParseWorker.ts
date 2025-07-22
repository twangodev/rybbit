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

      await fs.promises.unlink(tempFilePath);
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
      let chunkNumber = 0;
      let chunk: UmamiEvent[] = [];
      let rowsProcessed = 0;
      let pendingJobs: Promise<any>[] = [];

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

      const queueChunk = (chunk: UmamiEvent[], finalChunk: boolean = false) => {
        chunkNumber++;

        const jobPromise = boss.send(DATA_INSERT_QUEUE, {
          site,
          importId,
          source,
          chunk,
          chunkNumber,
          finalChunk,
        });

        pendingJobs.push(jobPromise);
        console.log(`Queued chunk ${chunkNumber} with ${chunk.length} records (finalChunk: ${finalChunk})`);

        return jobPromise;
      };

      await ImportStatusManager.updateStatus(importId, "processing");

      return new Promise<void>((resolve, reject) => {
        parseStream(stream, { headers: true, maxRows: importableEvents, discardUnmappedColumns: true, ignoreEmpty: true })
          .on("headers", (headers) => {
            if (!validHeaders(headers)) {
              cleanup(`Invalid ${source} headers`);
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
              queueChunk([...chunk], false);
              chunk = [];
            }
          })
          .on("end", async () => {
            try {
              // Queue any remaining chunk as the final chunk
              if (chunk.length > 0) {
                queueChunk([...chunk], true);
              } else if (chunkNumber > 0) {
                // If no remaining chunk but we have processed chunks,
                // we need to mark the last one as final
                // This is a edge case - we'll let the data insert worker handle completion
                // based on the finalChunk flag of the last chunk sent
              }

              // Wait for all job queuing to complete (not the jobs themselves)
              await Promise.all(pendingJobs);

              console.log(`Successfully queued ${chunkNumber} chunks for processing`);
              await cleanup("All chunks queued successfully", "completed");
              resolve();
            } catch (error) {
              console.error("Error queuing final chunks:", error);
              await cleanup(error instanceof Error ? error.message : "Unknown error");
              reject(error);
            }
          })
          .on("error", async (error) => {
            console.error("CSV parsing error:", error);
            stream.destroy();
            await cleanup(error.message);
            reject(error);
          });
      });
    } catch (error) {
      console.error("Error in CSV parse worker:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      await cleanup(errorMessage);
      throw error;
    }
  });
}
