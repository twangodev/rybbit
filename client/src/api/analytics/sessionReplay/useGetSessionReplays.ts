import { useInfiniteQuery } from "@tanstack/react-query";
import { useStore } from "../../../lib/store";
import { authedFetch, getQueryParams } from "../../utils";

export interface SessionReplayListItem {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  pageUrl: string;
  eventCount: number;
  recordingStatus: string;
  country: string;
  region: string;
  city: string;
  browser: string;
  browserVersion: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
}

export interface SessionReplayListResponse {
  data: SessionReplayListItem[];
  totalCount: number;
}

type UseGetSessionReplaysOptions = {
  limit?: number;
};

export function useGetSessionReplays({
  limit = 20,
}: UseGetSessionReplaysOptions = {}) {
  const { time, site } = useStore();

  return useInfiniteQuery({
    queryKey: ["session-replays", site, time, limit],
    queryFn: async ({ pageParam = 0 }) => {
      const queryParams = {
        ...getQueryParams(time),
        limit,
        offset: pageParam,
      };

      const response = await authedFetch<SessionReplayListResponse>(
        `/session-replay/list/${site}`,
        queryParams
      );
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce(
        (acc, page) => acc + (page.data?.length || 0),
        0
      );
      return lastPage.data?.length === limit ? totalFetched : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}