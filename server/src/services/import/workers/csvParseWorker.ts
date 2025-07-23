import fs from "fs";
import { parse } from "@fast-csv/parse";
import boss from "../../../db/postgres/boss.js";
import { CSV_PARSE_QUEUE, CsvParseJob, DATA_INSERT_QUEUE } from "./jobs.js";
import { Job } from "pg-boss";
import { UmamiEvent, umamiHeaders } from "../mappings/umami.js";
import { ImportStatusManager } from "../importStatusManager.js";
import { ImportLimiter } from "../importLimiter.js";

export async function registerCsvParseWorker() {
  await boss.work(CSV_PARSE_QUEUE, { batchSize: 1, pollingIntervalSeconds: 10 }, async ([ job ]: Job<CsvParseJob>[]) => {
    const { site, importId, source, tempFilePath, organization } = job.data;

    try {
      const importableEvents = await ImportLimiter.countImportableEvents(organization);
      if (importableEvents <= 0) {
        await ImportStatusManager.updateStatus(importId, "failed", "Event import limit reached");
        await fs.promises.unlink(tempFilePath);
        return;
      }

      const chunkSize = 1000;
      let chunk: UmamiEvent[] = [];

      const stream = fs.createReadStream(tempFilePath).pipe(parse({
        headers: umamiHeaders,
        renameHeaders: true,
        ignoreEmpty: true,
        maxRows: importableEvents,
      }));

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
      await fs.promises.unlink(tempFilePath);
    }
  });
}
