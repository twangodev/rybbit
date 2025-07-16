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

export interface DataInsertJob<T> extends ImportJob {
  chunk: T[];
  chunkNumber: number;
}

export interface ImportMapper<T> {
  transform(rows: T, site: string, importId: string): RybbitEvent[];
}

export interface ImportStatus {
  importId: string;
  siteId: number;
  organizationId: string;
  source: "umami";
  status: "pending" | "processing" | "completed" | "failed";
  totalRows: number | null;
  processedRows: number;
  chunksCompleted: number;
  totalChunks: number | null;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  fileName: string;
  fileSize: number;
  createdBy: string; // user_id
}

interface RybbitEvent {
  site_id: number;
  timestamp: string;
  session_id: string;
  user_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  url_parameters: Record<string, string>;
  page_title: string;
  referrer: string;
  channel: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  operating_system_version: string;
  language: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  screen_width: number;
  screen_height: number;
  device_type: string;
  type: string;
  event_name: string;
  props: Record<string, unknown>;
  lcp: number | null,
  cls: number | null,
  inp: number | null,
  fcp: number | null,
  ttfb: number | null,
  import_id: string | null,
}
