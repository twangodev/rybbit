import { UmamiEvent } from "../mappings/umami.js";

export const CSV_PARSE_QUEUE = "csv-parse";

export const DATA_INSERT_QUEUE = "data-insert";

interface ImportJob {
  site: string;
  importId: string;
  source: "umami";
}

export interface CsvParseJob extends ImportJob {
  tempFilePath: string;
  organization: string;
}

export interface DataInsertJob extends ImportJob {
  chunk: UmamiEvent[];
  allChunksSent: boolean;
}
