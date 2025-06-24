import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../../utils";

export interface SessionReplayEvent {
  timestamp: number;
  type: string | number;
  data: any;
}

export interface SessionReplayMetadata {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  durationMs?: number;
  eventCount: number;
  compressedSizeBytes: number;
  pageUrl: string;
  userAgent: string;
  country: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  deviceType: string;
  channel: string;
  hostname: string;
  referrer: string;
  hasReplayData: boolean;
  recordingStatus: 'recording' | 'completed' | 'failed';
  createdAt: Date;
}

export interface GetSessionReplayEventsResponse {
  events: SessionReplayEvent[];
  metadata: SessionReplayMetadata;
}

export function useGetSessionReplayEvents(siteId: number, sessionId: string) {
  return useQuery({
    queryKey: ["session-replay-events", siteId, sessionId],
    queryFn: () => {
      return authedFetch<GetSessionReplayEventsResponse>(
        `/session-replay/${siteId}/${sessionId}`
      );
    },
    enabled: !!siteId && !!sessionId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}