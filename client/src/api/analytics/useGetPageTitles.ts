import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { FilterParameter, useStore } from "@/lib/store";
import { timeZone } from "@/lib/dateTimeUtils";
import { APIResponse } from "../types";
import { BACKEND_URL } from "@/lib/const";
import { getStartAndEndDate, authedFetch } from "../utils";

// This should match PageTitleItem from the backend
export type PageTitleItem = {
  value: string; // The page_title
  pathname: string; // A representative pathname
  count: number;
  percentage: number;
  // Add other potential fields if your backend query for page_titles includes them
};

// This should match the paginated response structure from getPageTitles.ts
export type PageTitlesPaginatedResponse = {
  data: PageTitleItem[];
  totalCount: number;
};

// This is for non-paginated use by StandardSection (or similar)
// It directly expects an array of PageTitleItem	ype PageTitlesStandardResponse = PageTitleItem[];
export type PageTitlesStandardResponse = PageTitleItem[];

type UseGetPageTitlesOptions = {
  limit?: number;
  page?: number;
  useFilters?: boolean;
  // No specific 'parameter' needed as this hook is for page_titles
};

// Hook for paginated fetching (e.g., for a dedicated "All Page Titles" screen)
export function useGetPageTitlesPaginated({
  limit = 10,
  page = 1,
  useFilters = true,
}: UseGetPageTitlesOptions): UseQueryResult<
  APIResponse<PageTitlesPaginatedResponse>
> {
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
        limit,
        page,
        filters: useFilters ? filters : undefined,
      }
    : {
        // Regular date-based approach
        ...getStartAndEndDate(time),
        timeZone: timeZone,
        limit,
        page,
        filters: useFilters ? filters : undefined,
      };

  return useQuery({
    queryKey: [
      "page-titles",
      time,
      site,
      filters,
      limit,
      page,
      isPast24HoursMode ? "past-minutes" : "date-range",
    ],
    queryFn: () => {
      return authedFetch(
        `${BACKEND_URL}/page-titles/${site}`,
        queryParams
      ).then(
        (res: any) => res.json() // Added any type for res
      );
    },
    staleTime: Infinity,
  });
}
