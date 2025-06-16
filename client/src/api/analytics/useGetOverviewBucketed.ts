import { Filter, TimeBucket } from "@rybbit/shared";
import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { timeZone } from "../../lib/dateTimeUtils";
import { useStore } from "../../lib/store";
import { APIResponse } from "../types";
import { authedFetch, getQueryParams } from "../utils";

type PeriodTime = "current" | "previous";

export type GetOverviewBucketedResponse = {
  time: string;
  pageviews: number;
  sessions: number;
  pages_per_session: number;
  bounce_rate: number;
  session_duration: number;
  users: number;
}[];

export function useGetOverviewBucketed({
  periodTime,
  site,
  bucket = "hour",
  dynamicFilters = [],
  refetchInterval,
  overrideTime,
  props,
}: {
  periodTime?: PeriodTime;
  site: number | string;
  bucket?: TimeBucket;
  dynamicFilters?: Filter[];
  refetchInterval?: number;
  overrideTime?:
    | { mode: "past-minutes"; pastMinutesStart: number; pastMinutesEnd: number }
    | { mode: "range"; startDate: string; endDate: string };
  props?: Partial<UseQueryOptions<APIResponse<GetOverviewBucketedResponse>>>;
}): UseQueryResult<APIResponse<GetOverviewBucketedResponse>> {
  const { time, previousTime, filters: globalFilters } = useStore();

  // Use overrideTime if provided, otherwise use store time
  const baseTime = overrideTime || time;
  const timeToUse = periodTime === "previous" ? previousTime : baseTime;
  const combinedFilters = [...globalFilters, ...dynamicFilters];

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

  // Use getQueryParams utility to handle conditional logic
  const queryParams = getQueryParams(timeForQuery, {
    timeZone,
    bucket,
    filters: combinedFilters,
  });

  // Generate appropriate query key based on whether we're using past minutes or regular time
  const queryKey =
    timeForQuery.mode === "past-minutes"
      ? [
          "overview-bucketed-past-minutes",
          timeForQuery.pastMinutesStart,
          timeForQuery.pastMinutesEnd,
          site,
          bucket,
          combinedFilters,
        ]
      : ["overview-bucketed", timeForQuery, bucket, site, combinedFilters];

  return useQuery({
    queryKey,
    queryFn: () => {
      return authedFetch<APIResponse<GetOverviewBucketedResponse>>(
        `/overview-bucketed/${site}`,
        queryParams
      );
    },
    refetchInterval,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const queryKeyArray = query.queryKey as any[];

      // Find site in query key (position varies based on query type)
      const siteIndex = queryKeyArray.findIndex((item) => item === site);
      if (siteIndex !== -1) {
        return query.state.data;
      }
      return undefined;
    },
    staleTime: 60_000,
    ...props,
  });
}
