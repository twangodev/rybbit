import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/const";
import { Filter, TimeBucket, useStore } from "../../lib/store";
import { timeZone } from "../../lib/dateTimeUtils";
import { APIResponse } from "../types";
import { authedFetch, getStartAndEndDate } from "../utils";

type PeriodTime = "current" | "previous";

export type GetPerformanceTimeSeriesResponse = {
  time: string;
  lcp: number;
  cls: number;
  inp: number;
  fcp: number;
  ttfb: number;
}[];

export function useGetPerformanceTimeSeries({
  periodTime,
  site,
  bucket,
  dynamicFilters = [],
  props,
}: {
  periodTime?: PeriodTime;
  site: number | string;
  bucket?: TimeBucket;
  dynamicFilters?: Filter[];
  props?: Partial<
    UseQueryOptions<APIResponse<GetPerformanceTimeSeriesResponse>>
  >;
}): UseQueryResult<APIResponse<GetPerformanceTimeSeriesResponse>> {
  const {
    time,
    previousTime,
    filters: globalFilters,
    bucket: storeBucket,
    selectedPerformanceMetric,
    selectedPercentile,
  } = useStore();

  const timeToUse = periodTime === "previous" ? previousTime : time;
  const bucketToUse = bucket || storeBucket;

  const { startDate, endDate } = getStartAndEndDate(timeToUse);

  const combinedFilters = [...globalFilters, ...dynamicFilters];

  return useQuery({
    queryKey: [
      "performance-time-series",
      timeToUse,
      bucketToUse,
      site,
      combinedFilters,
      selectedPerformanceMetric,
      selectedPercentile,
    ],
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/performance/time-series/${site}`, {
        startDate,
        endDate,
        timeZone,
        bucket: bucketToUse,
        filters: combinedFilters,
        metric: selectedPerformanceMetric,
        percentile: selectedPercentile,
      }).then((res) => res.json());
    },
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const [, , , prevSite] = query.queryKey as [
        string,
        any,
        TimeBucket,
        string | number,
        Filter[],
        string,
        string
      ];

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
    staleTime: Infinity,
    ...props,
  });
}
