import fs from "fs";
import { parseStream } from "@fast-csv/parse";
import boss from "../lib/boss.js";
import { importInitiationQueue, ImportInitiationJob, processImportChunkQueue } from "../types/import.js";
import { Job } from "pg-boss";
import { umamiHeaders } from "./mappings/umami.js";
import { clickhouse } from "../db/clickhouse/clickhouse.js";
import { processResults } from "../api/analytics/utils.js";

await boss.work(importInitiationQueue, async (job: Job<ImportInitiationJob>[]) => {
  const { tempFilePath, site, importId, source } = job[0].data;

  const query = await clickhouse.query({
    query: `
    SELECT count() AS count
    FROM events
    WHERE site_id = {siteId:UInt16}
    AND import_id IS NOT NULL
    `,
    format: "JSONEachRow",
    query_params: {
      siteId: Number(site),
    },
  });
  const result = await processResults<{ count: number }>(query);
  const importedRowCount = result[0].count;

  const maxImportedRows = 1000000;
  const remainingRows = maxImportedRows - importedRowCount;
  if (remainingRows <= 0) {
    console.log(`🛑 No remaining rows can be imported (already imported: ${importedRowCount}).`);
    await fs.promises.unlink(tempFilePath);
    return;
  }

  const chunkSize = 1000;
  const maxChunks = Math.ceil(remainingRows / chunkSize);
  let chunkNumber = 0;
  let chunk: any[] = [];
  let shouldStop = false;

  const stream = fs.createReadStream(tempFilePath);

  const arraysAreEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) {
      return false;
    }
    return arr1.every((value, index) => value === arr2[index]);
  }

  const validateHeaders = (headers: string[]): boolean => {
    switch (source) {
      case "umami":
        return arraysAreEqual(umamiHeaders, headers);
      default:
        return false;
    }
  };

  const cleanup = async (reason: string) => {
    console.log(`🛑 Stopping CSV processing: ${reason}`);
    shouldStop = true;

    if (!stream.destroyed) {
      stream.destroy();
    }

    try {
      await fs.promises.unlink(tempFilePath);
      console.log(`🗑️ Deleted temporary file: ${tempFilePath}`);
    } catch (error) {
      console.error(`Failed to delete file ${tempFilePath}:`, error);
    }
  };

  parseStream(stream, { headers: true })
    .on("headers", async (headers) => {
      if (!validateHeaders(headers)) {
        await cleanup("Header validation failed");
        return;
      }
    })
    .on("data", async (row) => {
      if (shouldStop) {
        return;
      }

      chunk.push(row);

      if (chunk.length >= chunkSize) {
        chunkNumber++;

        if (chunkNumber > maxChunks) {
          await cleanup(`Maximum import limit reached: ${maxImportedRows} rows total (already imported: ${importedRowCount})`);
          return;
        }

        await boss.send(processImportChunkQueue, {
          site,
          importId,
          source,
          chunk,
          chunkNumber,
        });
        chunk = [];
      }
    })
    .on("end", async (rowCount: number) => {
      if (!shouldStop && chunk.length > 0) {
        chunkNumber++;

        await boss.send(processImportChunkQueue, {
          site,
          importId,
          source,
          chunk,
          chunkNumber,
        });
      }

      if (!shouldStop) {
        console.log(`✅ Split file ${rowCount} rows into ${chunkNumber} chunks for ${site} in batch ${importId}.`);

        try {
          await fs.promises.unlink(tempFilePath);
          console.log(`🗑️ Deleted temporary file: ${tempFilePath}`);
        } catch (error) {
          console.error(`Failed to delete file ${tempFilePath}:`, error);
        }
      }
    })
    .on("error", async (error) => {
      console.error("CSV parsing error:", error);
      await cleanup("CSV parsing error occurred");
    });
});
