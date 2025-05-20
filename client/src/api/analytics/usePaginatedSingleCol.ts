import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { FilterParameter, useStore } from "@/lib/store";
import { timeZone } from "@/lib/dateTimeUtils";
import { APIResponse } from "@/api/types";
import { BACKEND_URL } from "@/lib/const";
import { getStartAndEndDate, authedFetch } from "@/api/utils";
import { SingleColResponse } from "@/api/analytics/useSingleCol";

type UsePaginatedSingleColOptions = {
  parameter: FilterParameter;
  limit?: number;
  offset?: number;
  useFilters?: boolean;
};

// Reverted: Backend will now return this structure inside APIResponse.data
type PaginatedResponse = {
  data: SingleColResponse[];
  totalCount: number;
};

export function usePaginatedSingleCol({
  parameter,
  limit = 10,
  offset = 0,
  useFilters = true,
}: UsePaginatedSingleColOptions): UseQueryResult<
  APIResponse<PaginatedResponse> // Adjusted return type back
> {
  const { time, site, filters } = useStore();

  // Determine the query parameters based on mode
  const queryParams = {
    ...getStartAndEndDate(time),
    timeZone: timeZone,
    parameter,
    limit,
    offset,
    filters: useFilters ? filters : undefined,
  };

  return useQuery({
    queryKey: [
      parameter,
      time,
      site,
      filters,
      limit,
      offset,
      "paginated-single-col",
    ], // More specific key
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/single-col/${site}`, queryParams).then(
        (res) => res.json()
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
