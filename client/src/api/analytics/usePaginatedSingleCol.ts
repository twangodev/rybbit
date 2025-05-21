import { SingleColResponse } from "@/api/analytics/useSingleCol";
import { authedFetch, getStartAndEndDate } from "@/api/utils";
import { BACKEND_URL } from "@/lib/const";
import { timeZone } from "@/lib/dateTimeUtils";
import { FilterParameter, useStore } from "@/lib/store";
import { useQuery, UseQueryResult } from "@tanstack/react-query";

type UsePaginatedSingleColOptions = {
  parameter: FilterParameter;
  limit?: number;
  page?: number;
  useFilters?: boolean;
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
}: UsePaginatedSingleColOptions): UseQueryResult<PaginatedResponse> {
  const { time, site, filters } = useStore();

  // Determine the query parameters based on mode
  const queryParams = {
    ...getStartAndEndDate(time),
    timeZone: timeZone,
    parameter,
    limit,
    page,
    filters: useFilters ? filters : undefined,
  };

  return useQuery({
    queryKey: [
      parameter,
      time,
      site,
      filters,
      limit,
      page,
      "paginated-single-col",
    ], // More specific key
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
  });
}
