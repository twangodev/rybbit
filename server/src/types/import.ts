export const importInitiationQueue = "import-initiation";

export const processImportChunkQueue = "process-import-chunk";

interface ImportJob {
  site: string;
  importId: string;
  source: "umami";
}

export interface ImportInitiationJob extends ImportJob {
  tempFilePath: string;
}

export interface ProcessImportChunkJob<T> extends ImportJob {
  chunk: T[];
  chunkNumber: number;
}

export interface ImportMapper<T> {
  transform(rows: T, site: string, importId: string): RybbitEvent[];
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
