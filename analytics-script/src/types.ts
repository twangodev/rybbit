export interface RybbitConfig {
  siteId: string;
  analyticsHost: string;
  debounceDuration: number;
  autoTrackPageview: boolean;
  autoTrackSpa: boolean;
  trackQuerystring: boolean;
  trackOutbound: boolean;
  enableWebVitals: boolean;
  skipPatterns: string[];
  maskPatterns: string[];
}

export interface TrackingPayload {
  site_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  page_title: string;
  referrer: string;
  type: EventType;
  event_name?: string;
  properties?: string;
  user_id?: string;
  // Web Vitals specific fields
  lcp?: number | null;
  cls?: number | null;
  inp?: number | null;
  fcp?: number | null;
  ttfb?: number | null;
}

export type EventType =
  | "pageview"
  | "custom_event"
  | "outbound"
  | "performance";

export interface CustomEventProperties {
  [key: string]: string | number | boolean;
}

export interface OutboundLinkProperties {
  url: string;
  text: string;
  target: string;
}

export interface WebVitalsData {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  fcp: number | null;
  ttfb: number | null;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

export interface RybbitAPI {
  pageview: () => void;
  event: (name: string, properties?: CustomEventProperties) => void;
  trackOutbound: (url: string, text?: string, target?: string) => void;
  identify: (userId: string) => void;
  clearUserId: () => void;
  getUserId: () => string | null;
}

declare global {
  interface Window {
    rybbit: RybbitAPI;
    __RYBBIT_OPTOUT__?: boolean;
    webVitals?: any; // Web Vitals library types
  }
}
