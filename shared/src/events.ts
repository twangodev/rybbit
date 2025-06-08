export interface EventData {
  eventName: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: string;
  sessionId: string;
  userId: string;
  pathname?: string;
  referrer?: string;
  browser?: string;
  operatingSystem?: string;
  device?: string;
  country?: string;
  city?: string;
}

export interface EventProperty {
  key: string;
  values: Array<{
    value: string | number | boolean;
    count: number;
  }>;
}