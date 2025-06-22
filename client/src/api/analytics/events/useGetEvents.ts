import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Time } from "../../../components/DateSelector/types";
import { timeZone } from "../../../lib/dateTimeUtils";
import { useStore } from "../../../lib/store";
import { authedFetch, getStartAndEndDate } from "../../utils";

export type Event = {
  timestamp: string;
  event_name: string;
  properties: string;
  user_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  page_title: string;
  referrer: string;
  browser: string;
  operating_system: string;
  country: string;
  device_type: string;
  type: string;
};

export interface EventsResponse {
  data: Event[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  isRealtime?: boolean;
}

export interface GetEventsOptions {
  time?: Time;
  page?: number;
  pageSize?: number;
  count?: number; // For backward compatibility
  isRealtime?: boolean;
}

// New hook with pagination and filtering support
export function useGetEventsInfinite(options: GetEventsOptions = {}) {
  const { site, time, filters } = useStore();
  const { startDate, endDate } = options.time
    ? getStartAndEndDate(options.time)
    : getStartAndEndDate(time);
  const pageSize = options.pageSize || 20;

  return useInfiniteQuery<EventsResponse, Error>({
    queryKey: [
      "events-infinite",
      site,
      startDate,
      endDate,
      timeZone,
      filters,
      pageSize,
      options.isRealtime,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params: Record<string, any> = {
        startDate,
        endDate,
        timeZone,
        page: pageParam,
        pageSize,
      };

      // Add filters if provided
      if (filters && filters.length > 0) {
        params.filters = JSON.stringify(filters);
      }

      // Add count if provided (for backward compatibility)
      if (options.count) {
        params.count = options.count;
      }

      const response = await authedFetch<EventsResponse>(
        `/events/${site}`,
        params
      );
      return response;
    },
    getNextPageParam: (lastPage: EventsResponse) => {
      if (
        lastPage.pagination &&
        lastPage.pagination.page < lastPage.pagination.totalPages
      ) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    refetchInterval: options.isRealtime ? 5000 : undefined,
  });
}

// New hook for real-time events with timestamp-based polling
export function useGetEventsRealtime(options: { pageSize?: number } = {}) {
  const { site } = useStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [newEventsCount, setNewEventsCount] = useState(0);
  const pageSize = options.pageSize || 50;

  const { data, isLoading, error } = useQuery<EventsResponse>({
    queryKey: ["events-realtime", site, lastTimestamp, pageSize],
    queryFn: async () => {
      const params: Record<string, any> = {
        pageSize,
      };

      // If we have a last timestamp, fetch only newer events
      if (lastTimestamp) {
        params.afterTimestamp = lastTimestamp;
      }

      const response = await authedFetch<EventsResponse>(
        `/events/${site}`,
        params
      );
      return response;
    },
    refetchInterval: 1500, // Poll every 1.5 seconds
    enabled: !!site,
  });

  // Merge new events with existing ones
  useEffect(() => {
    if (data?.data && data.data.length > 0) {
      if (lastTimestamp) {
        // Merge new events at the beginning (newest first)
        setEvents((prev) => {
          const newEvents = data.data.filter(
            (event) => !prev.some((e) => e.timestamp === event.timestamp)
          );
          
          if (newEvents.length > 0) {
            setNewEventsCount(newEvents.length);
            // Reset the counter after 3 seconds
            setTimeout(() => setNewEventsCount(0), 3000);
          }
          
          return [...newEvents, ...prev].slice(0, 200); // Keep max 200 events
        });
      } else {
        // Initial load
        setEvents(data.data);
      }

      // Update last timestamp to the newest event
      const newestTimestamp = data.data[0]?.timestamp;
      if (newestTimestamp && newestTimestamp > (lastTimestamp || "")) {
        setLastTimestamp(newestTimestamp);
      }
    }
  }, [data, lastTimestamp]);

  return {
    events,
    isLoading,
    error,
    totalEvents: events.length,
    newEventsCount,
  };
}
