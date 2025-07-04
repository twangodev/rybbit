export const importInitiationQueue = "import-initiation";

export const processImportChunkQueue = "process-import-chunk";

export interface ImportInitiationJob {
  tempFilePath: string;
  site: string;
  importId: string;
  source: "umami";
}

export interface ImportMapping<T> {
  transform(row: T, headers: string[]): RybbitEvent;
}

interface RybbitEvent {
  site_id: number; // UInt16
  timestamp: string; // ISO 8601 format (DateTime)
  session_id: string;
  user_id: string;
  hostname: string;
  pathname: string;
  querystring: string; // Raw URL parameters
  url_parameters: Record<string, string>; // Map(String, String)
  page_title: string;
  referrer: string;
  channel: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  operating_system_version: string;
  language: string;
  country: string; // ISO 3166-1 alpha-2 (FixedString(2))
  region: string;
  city: string;
  lat: number;
  lon: number;
  screen_width: number; // UInt16
  screen_height: number; // UInt16
  device_type: string;
  type: string; // Defaults to 'pageview'
  event_name: string;
  props: Record<string, unknown>; // JSON
}
