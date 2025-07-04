import fs from 'fs';
import { parse } from '@fast-csv/parse';
import boss from "../lib/boss.js";
import { importInitiationQueue, ImportInitiationJob, processImportChunkQueue } from "../types/import.js";
import { Job } from "pg-boss";

await boss.work(importInitiationQueue, async (job: Job<ImportInitiationJob>[]) => {
  const { tempFilePath, site, importId, source } = job[0].data;
  let chunkNumber = 0;
  let rowCount = 0;
  const chunkSize = 1000;
  let chunk = [];

  const stream = fs.createReadStream(tempFilePath);
  // const parser = parse(stream);

  const parser = fs.createReadStream(tempFilePath).pipe(parse());

  for await (const row of parser) {
    chunk.push(row);
    rowCount++;

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
  }

  if (chunk.length > 0) {
    await boss.send(processImportChunkQueue, {
      importId,
      source,
      site,
      chunkNumber: ++chunkNumber,
      records: chunk,
    });
  }

  console.log(`✅ Split file ${tempFilePath} into ${chunkNumber} chunks for batch ${importId}.`);

  await fs.promises.unlink(tempFilePath);
});
