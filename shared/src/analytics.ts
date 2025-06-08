export interface OverviewData {
  pageviews: number;
  users: number;
  sessions: number;
  bounce_rate: number;
  avg_duration: number;
  events?: number;
}

export interface BucketedData {
  pageviews: Array<{ bucket: string; value: number }>;
  users: Array<{ bucket: string; value: number }>;
  sessions: Array<{ bucket: string; value: number }>;
  bounce_rate: Array<{ bucket: string; value: number }>;
  avg_duration: Array<{ bucket: string; value: number }>;
  events?: Array<{ bucket: string; value: number }>;
}

export interface SingleColumnData {
  key: string;
  value: number;
  percentage?: number;
  sparkline?: number[];
}

export interface SessionData {
  sessionId: string;
  userId: string;
  pageCount: number;
  eventCount: number;
  sessionStart: string;
  sessionEnd: string;
  duration: number;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  entryPage?: string;
  exitPage?: string;
  referrer?: string;
}

export interface UserData {
  userId: string;
  firstSeen: string;
  lastSeen: string;
  sessionCount: number;
  pageviewCount: number;
  eventCount: number;
  totalDuration: number;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
}