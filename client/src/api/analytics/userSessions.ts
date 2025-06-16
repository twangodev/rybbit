import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { timeZone } from "../../lib/dateTimeUtils";
import {
  getFilteredFilters,
  SESSION_PAGE_FILTERS,
  useStore,
} from "../../lib/store";
import { APIResponse } from "../types";
import { authedFetch, getQueryParams } from "../utils";

export type UserSessionsResponse = {
  session_id: string;
  browser: string;
  operating_system: string;
  device_type: string;
  country: string;
  firstTimestamp: string;
  lastTimestamp: string;
  duration: number; // Duration in seconds
  pageviews: {
    pathname: string;
    querystring: string;
    title: string;
    timestamp: string;
    referrer: string;
  }[];
}[];

export function useGetUserSessions(userId: string) {
  const { time, site, filters } = useStore();
  const timeParams = getQueryParams(time);

  return useQuery({
    queryKey: ["user-sessions", userId, time, site, filters],
    queryFn: () => {
      return authedFetch<UserSessionsResponse>(
        `/user/${userId}/sessions/${site}`,
        {
          ...timeParams,
          filters,
        }
      );
    },
    staleTime: Infinity,
  });
}

export type GetSessionsResponse = {
  session_id: string;
  user_id: string;
  country: string;
  region: string;
  city: string;
  language: string;
  device_type: string;
  browser: string;
  operating_system: string;
  referrer: string;
  channel: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  session_end: string;
  session_start: string;
  session_duration: number;
  entry_page: string;
  exit_page: string;
  pageviews: number;
  events: number;
}[];

export function useGetSessionsInfinite(userId?: string) {
  const { time, site, filters } = useStore();

  // Get the appropriate time parameters using getQueryParams
  const timeParams = getQueryParams(time);

  const filteredFilters = getFilteredFilters(SESSION_PAGE_FILTERS);

  return useInfiniteQuery<APIResponse<GetSessionsResponse>>({
    queryKey: ["sessions-infinite", time, site, filteredFilters, userId],
    queryFn: ({ pageParam = 1 }) => {
      // Use an object for request parameters so we can conditionally add fields
      const requestParams: Record<string, any> = {
        timeZone,
        filters: filteredFilters,
        page: pageParam,
      };

      // Add userId if provided
      if (userId) {
        requestParams.userId = userId;
      }

      // Add time parameters
      if (time.mode === "past-minutes") {
        Object.assign(requestParams, timeParams);
      } else if (!userId) {
        // Only add date parameters if not filtering by userId
        requestParams.startDate = timeParams.startDate;
        requestParams.endDate = timeParams.endDate;
      }

      return authedFetch<APIResponse<GetSessionsResponse>>(
        `/sessions/${site}`,
        requestParams
      );
    },
    initialPageParam: 1,
    getNextPageParam: (
      lastPage: APIResponse<GetSessionsResponse>,
      allPages
    ) => {
      // If we have data and it's a full page (100 items), there might be more
      if (lastPage?.data && lastPage.data.length === 100) {
        return allPages.length + 1;
      }
      return undefined;
    },
    staleTime: Infinity,
  });
}

export interface SessionDetails {
  session_id: string;
  user_id: string;
  country: string;
  region: string;
  language: string;
  device_type: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  operating_system_version: string;
  screen_width: number;
  screen_height: number;
  referrer: string;
  session_end: string;
  session_start: string;
  pageviews: number;
  entry_page: string;
  exit_page: string;
}

export interface SessionEvent {
  timestamp: string;
  pathname: string;
  hostname: string;
  querystring: string;
  page_title: string;
  referrer: string;
  type: string;
  event_name?: string;
  props?: string;
}

export interface SessionPageviewsAndEvents {
  session: SessionDetails;
  events: SessionEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export function useGetSessionDetailsInfinite(sessionId: string | null) {
  const { site, time } = useStore();
  const pastMinutesMode = time.mode === "past-minutes";

  // Get minutes based on the time mode
  let minutes: number | undefined;
  if (pastMinutesMode) {
    if (time.mode === "past-minutes") {
      minutes = time.pastMinutesStart; // Use the dynamic value
    }
  }

  return useInfiniteQuery<APIResponse<SessionPageviewsAndEvents>>({
    queryKey: ["session-details-infinite", sessionId, site, minutes],
    queryFn: ({ pageParam = 0 }) => {
      if (!sessionId) throw new Error("Session ID is required");
      const limit = 100;

      // Build query parameters object
      const queryParams: Record<string, any> = {
        limit,
        offset: pageParam,
      };

      if (pastMinutesMode && minutes) {
        queryParams.minutes = minutes;
      }

      return authedFetch<APIResponse<SessionPageviewsAndEvents>>(
        `/session/${sessionId}/${site}`,
        queryParams
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.data?.pagination?.hasMore) {
        return lastPage.data.pagination.offset + lastPage.data.pagination.limit;
      }
      return undefined;
    },
    enabled: !!sessionId && !!site,
    staleTime: Infinity,
  });
}

export interface UserSessionCountResponse {
  date: string;
  sessions: number;
}

export function useGetUserSessionCount(userId: string) {
  const { site } = useStore();

  return useQuery<APIResponse<UserSessionCountResponse[]>>({
    queryKey: ["user-session-count", userId, site],
    queryFn: () => {
      return authedFetch<APIResponse<UserSessionCountResponse[]>>(
        `/user/session-count/${site}`,
        {
          userId,
          timeZone,
        }
      );
    },
    staleTime: Infinity,
  });
}
