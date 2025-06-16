import { FilterParameter } from "@rybbit/shared";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useStore } from "../../lib/store";
import { APIResponse } from "../types";
import { authedFetch, getQueryParams } from "../utils";

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

  // For "previous" periods in past-minutes mode, we need to modify the time object
  // to use doubled duration for the start and the original start as the end
  const timeForQuery =
    timeToUse.mode === "past-minutes" && periodTime === "previous"
      ? {
          ...timeToUse,
          pastMinutesStart: timeToUse.pastMinutesStart * 2,
          pastMinutesEnd: timeToUse.pastMinutesStart,
        }
      : timeToUse;

  const queryParams = getQueryParams(timeForQuery, {
    parameter,
    limit,
    filters: useFilters ? filters : undefined,
  });

  const queryKey = [parameter, timeForQuery, site, filters, limit, useFilters];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await authedFetch<{
        data: APIResponse<SingleColResponse[]>;
      }>(`/single-col/${site}`, queryParams);
      return response.data;
    },
    staleTime: 60_000,
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
