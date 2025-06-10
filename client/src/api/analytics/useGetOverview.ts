import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../lib/store";
import { authedFetch, getQueryParams } from "../utils";

export type GetOverviewResponse = {
  sessions: number;
  pageviews: number;
  users: number;
  pages_per_session: number;
  bounce_rate: number;
  session_duration: number;
};

type PeriodTime = "current" | "previous";

type UseGetOverviewOptions = {
  periodTime?: PeriodTime;
  site?: number | string;
  // Optional parameters for custom past minutes (for backward compatibility)
  pastMinutesStart?: number;
  pastMinutesEnd?: number;
};

export function useGetOverview({
  periodTime,
  site,
  pastMinutesStart,
  pastMinutesEnd,
}: UseGetOverviewOptions) {
  const { time, previousTime, filters } = useStore();
  const timeToUse = periodTime === "previous" ? previousTime : time;

  // Use custom past minutes if provided, otherwise use the time-based approach
  const queryParams =
    pastMinutesStart !== undefined && pastMinutesEnd !== undefined
      ? getQueryParams(
          timeToUse,
          { filters },
          { pastMinutesStart, pastMinutesEnd }
        )
      : getQueryParams(timeToUse, { filters });

  // Create appropriate query key based on the parameters used
  const queryKey =
    pastMinutesStart !== undefined && pastMinutesEnd !== undefined
      ? [
          "overview-past-minutes",
          pastMinutesStart,
          pastMinutesEnd,
          site,
          filters,
        ]
      : [
          "overview",
          timeToUse,
          site,
          filters,
          timeToUse.mode === "last-24-hours" ? "past-minutes" : "date-range",
        ];

  return useQuery({
    queryKey,
    queryFn: () => {
      return authedFetch<{ data: GetOverviewResponse }>(
        `/overview/${site}`,
        queryParams
      );
    },
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey;
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}
