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
  import_id: string;
  site_id: string;
  organization: string;
  source: "umami";
  status: "pending" | "processing" | "completed" | "failed";
  total_rows?: number;
  processed_rows: number;
  chunks_completed: number;
  total_chunks?: number;
  error_message?: string;
  started_at: Date;
  completed_at?: Date;
  file_name: string;
  file_size: number;
  created_by: string; // user_id
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
