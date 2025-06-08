import { Filter, TimeBucket } from "@rybbit/shared";
import {
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from "@tanstack/react-query";
import { usePerformanceStore } from "../../app/[site]/performance/performanceStore";
import { BACKEND_URL } from "../../lib/const";
import { timeZone } from "../../lib/dateTimeUtils";
import { useStore } from "../../lib/store";
import { APIResponse } from "../types";
import { authedFetch, getStartAndEndDate } from "../utils";

type PeriodTime = "current" | "previous";

export type GetPerformanceTimeSeriesResponse = {
  time: string;
  event_count: number;
  lcp_p50: number | null;
  lcp_p75: number | null;
  lcp_p90: number | null;
  lcp_p99: number | null;
  cls_p50: number | null;
  cls_p75: number | null;
  cls_p90: number | null;
  cls_p99: number | null;
  inp_p50: number | null;
  inp_p75: number | null;
  inp_p90: number | null;
  inp_p99: number | null;
  fcp_p50: number | null;
  fcp_p75: number | null;
  fcp_p90: number | null;
  fcp_p99: number | null;
  ttfb_p50: number | null;
  ttfb_p75: number | null;
  ttfb_p90: number | null;
  ttfb_p99: number | null;
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
  } = useStore();
  const { selectedPerformanceMetric } = usePerformanceStore();

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
    ],
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/performance/time-series/${site}`, {
        startDate,
        endDate,
        timeZone,
        bucket: bucketToUse,
        filters: combinedFilters,
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
