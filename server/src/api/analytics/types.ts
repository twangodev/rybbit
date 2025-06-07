export type FilterType = "equals" | "not_equals" | "contains" | "not_contains";

export type FilterParameter =
  | "browser"
  | "operating_system"
  | "language"
  | "country"
  | "region"
  | "city"
  | "device_type"
  | "referrer"
  | "hostname"
  | "pathname"
  | "page_title"
  | "querystring"
  | "event_name"
  | "channel"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
  // derivative parameters
  | "entry_page"
  | "exit_page"
  | "dimensions"
  | "browser_version"
  | "operating_system_version";

export type Filter = {
  parameter: FilterParameter;
  value: string[];
  type: FilterType;
};

// Performance-related types
export type WebVitalMetric = "lcp" | "cls" | "inp" | "fcp" | "ttfb";

export type PercentileLevel = "p50" | "p75" | "p90" | "p99";

export type TimeBucket =
  | "minute"
  | "five_minutes"
  | "ten_minutes"
  | "fifteen_minutes"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "year";

export type PerformanceOverviewMetrics = {
  [K in WebVitalMetric as `${K}_${PercentileLevel}`]: number | null;
} & {
  total_performance_events: number;
};

export type PerformanceTimeSeriesPoint = {
  time: string;
  event_count: number;
} & {
  [K in WebVitalMetric as `${K}_${PercentileLevel}`]: number | null;
};

export type PerformanceByPathItem = {
  pathname: string;
  event_count: number;
} & {
  [K in WebVitalMetric as `${K}_avg`]: number | null;
} & {
  [K in WebVitalMetric as `${K}_${PercentileLevel}`]: number | null;
};
