import fs from "fs";
import { parseStream } from "@fast-csv/parse";
import boss from "../lib/boss.js";
import { importInitiationQueue, ImportInitiationJob, processImportChunkQueue } from "../types/import.js";
import { Job } from "pg-boss";

await boss.work(importInitiationQueue, async (job: Job<ImportInitiationJob>[]) => {
  const { tempFilePath, site, importId, source } = job[0].data;
  const chunkSize = 1000;
  let chunkNumber = 0;
  let chunk: any[] = [];

  const stream = fs.createReadStream(tempFilePath);

  parseStream(stream, { headers: true })
    .on("headers", headers => console.log(headers)) // validate headers
    .on("data", async (row) => {
      chunk.push(row);

      if (chunk.length >= chunkSize) {
        await boss.send(processImportChunkQueue, {
          importId,
          source,
          site,
          chunkNumber: ++chunkNumber,
          records: chunk,
        });
        chunk = [];
      }
    })
    .on("end", async (rowCount: number) => {
      if (chunk.length > 0) {
        await boss.send(processImportChunkQueue, {
          importId,
          source,
          site,
          chunkNumber: ++chunkNumber,
          records: chunk,
        });
      }
      console.log(`✅ Split file ${rowCount} rows into ${chunkNumber} chunks for ${site} in batch ${importId}.`);
    })
    .on("error", error => console.error("CSV parsing error:", error));

  await fs.promises.unlink(tempFilePath);
});
