import { Filter, FilterParameter } from "@rybbit/shared";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { SingleColResponse } from "@/api/analytics/useSingleCol";
import { authedFetch, getStartAndEndDate } from "@/api/utils";
import { BACKEND_URL } from "@/lib/const";
import { timeZone } from "@/lib/dateTimeUtils";
import { useStore } from "@/lib/store";

type UsePaginatedSingleColOptions = {
  parameter: FilterParameter;
  limit?: number;
  page?: number;
  useFilters?: boolean;
  enabled?: boolean;
  additionalFilters?: Filter[];
};

type PaginatedResponse = {
  data: SingleColResponse[];
  totalCount: number;
};

export function usePaginatedSingleCol({
  parameter,
  limit = 10,
  page = 1,
  useFilters = true,
  enabled = true,
  additionalFilters = [],
}: UsePaginatedSingleColOptions): UseQueryResult<PaginatedResponse> {
  const { time, site, filters } = useStore();

  // Check if we're using last-24-hours mode
  const isPast24HoursMode = time.mode === "last-24-hours";

  // Determine the query parameters based on mode
  const queryParams = isPast24HoursMode
    ? {
        // Past minutes approach for last-24-hours mode
        timeZone: timeZone,
        pastMinutesStart: 24 * 60, // 24 hours ago
        pastMinutesEnd: 0, // now
        parameter,
        limit,
        page,
        filters: useFilters ? [...filters, ...additionalFilters] : undefined,
      }
    : {
        // Regular date-based approach
        ...getStartAndEndDate(time),
        timeZone: timeZone,
        parameter,
        limit,
        page,
        filters: useFilters ? [...filters, ...additionalFilters] : undefined,
      };

  return useQuery({
    queryKey: [
      parameter,
      time,
      site,
      filters,
      limit,
      page,
      isPast24HoursMode ? "past-minutes" : "date-range",
      additionalFilters,
    ],
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/single-col/${site}`, queryParams)
        .then((res) => res.json())
        .then(({ data }) => data);
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
    enabled,
  });
}
