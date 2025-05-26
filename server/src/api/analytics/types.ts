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
