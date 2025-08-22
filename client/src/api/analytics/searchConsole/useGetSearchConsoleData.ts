import { useQuery } from "@tanstack/react-query";
import {
  getFilteredFilters,
  SEARCH_CONSOLE_PAGE_FILTERS,
  useStore,
} from "../../../lib/store";
import { authedFetch, getQueryParams } from "../../utils";

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  averagePosition: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Time series data for charts
  timeSeries: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Device breakdown
  deviceBreakdown: Array<{
    device: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Country breakdown
  countryBreakdown: Array<{
    country: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Search appearance breakdown
  searchAppearance: Array<{
    appearance: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Top queries by position improvement
  topPositionImprovements: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    positionChange: number;
  }>;
  // Top queries by clicks growth
  topClicksGrowth: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    clicksChange: number;
  }>;
  // Page performance by clicks
  topPagesByClicks: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Page performance by impressions
  topPagesByImpressions: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  // Search type breakdown
  searchTypeBreakdown: Array<{
    searchType: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Rich results data
  richResults: Array<{
    type: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number;
  }>;
  // Core Web Vitals data (if available)
  coreWebVitals?: {
    lcp: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
    fid: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
    cls: {
      good: number;
      needsImprovement: number;
      poor: number;
    };
  };
}

export function useGetSearchConsoleData({
  enabled = true,
}: {
  enabled?: boolean;
} = {}) {
  const { site, time } = useStore();
  const filteredFilters = getFilteredFilters(SEARCH_CONSOLE_PAGE_FILTERS);
  const timeParams = getQueryParams(time);

  return useQuery({
    queryKey: [
      "search-console",
      site,
      timeParams,
      filteredFilters,
    ],
    queryFn: async () => {
      return authedFetch<SearchConsoleData>(`/search-console/${site}`, {
        ...timeParams,
        filteredFilters,
      });
    },
    enabled: !!site && enabled,
  });
}
