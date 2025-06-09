import { FilterParameter } from "@rybbit/shared";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { timeZone } from "../../lib/dateTimeUtils";
import { useStore } from "../../lib/store";
import { APIResponse } from "../types";
import { authedFetch, getStartAndEndDate } from "../utils";

type PeriodTime = "current" | "previous";

export type SingleColResponse = {
  value: string;
  title?: string;
  count: number;
  percentage: number;
  pageviews?: number;
  pageviews_percentage?: number;
  time_on_page_seconds?: number;
};

export function useSingleCol({
  parameter,
  limit = 1000,
  periodTime,
  useFilters = true,
}: {
  parameter: FilterParameter;
  limit?: number;
  periodTime?: PeriodTime;
  useFilters?: boolean;
}): UseQueryResult<APIResponse<SingleColResponse[]>> {
  const { time, previousTime, site, filters } = useStore();
  const timeToUse = periodTime === "previous" ? previousTime : time;

  // Check if we're using last-24-hours mode
  const isPast24HoursMode = timeToUse.mode === "last-24-hours";

  // Determine the query parameters based on mode
  const queryParams = isPast24HoursMode
    ? {
        // Past minutes approach using pastMinutesStart/pastMinutesEnd
        timeZone: timeZone,
        parameter,
        limit,
        pastMinutesStart: periodTime === "previous" ? 48 * 60 : 24 * 60,
        pastMinutesEnd: periodTime === "previous" ? 24 * 60 : 0,
        filters: useFilters ? filters : undefined,
      }
    : {
        // Regular date-based approach
        ...getStartAndEndDate(timeToUse),
        timeZone: timeZone,
        parameter,
        limit,
        filters: useFilters ? filters : undefined,
      };

  // Use a consistent query key format that includes the mode
  const queryKey = [
    parameter,
    timeToUse,
    site,
    filters,
    limit,
    useFilters,
    isPast24HoursMode ? "past-minutes" : "date-range",
  ];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await authedFetch<{
        data: APIResponse<SingleColResponse[]>;
      }>(`/single-col/${site}`, queryParams);
      return response.data;
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}

export function useSingleColRealtime({
  parameter,
  limit = 1000,
  pastMinutesStart = 30,
  pastMinutesEnd = 0,
}: {
  parameter: FilterParameter;
  limit?: number;
  pastMinutesStart?: number;
  pastMinutesEnd?: number;
}): UseQueryResult<APIResponse<SingleColResponse[]>> {
  const { site } = useStore();

  return useQuery({
    queryKey: [
      parameter,
      site,
      limit,
      pastMinutesStart,
      pastMinutesEnd,
      "realtime",
    ],
    queryFn: () => {
      return authedFetch<APIResponse<SingleColResponse[]>>(
        `/single-col/${site}`,
        {
          timeZone,
          parameter,
          limit,
          pastMinutesStart,
          pastMinutesEnd,
        }
      );
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}
