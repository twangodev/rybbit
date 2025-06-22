import { useStore } from "@/lib/store";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { APIResponse } from "../../types";
import { authedFetch, getQueryParams } from "../../utils";

// This should match ErrorEvent from the backend
export type ErrorEvent = {
  timestamp: string;
  session_id: string;
  user_id: string | null;
  pathname: string | null;
  hostname: string | null;
  page_title: string | null;
  referrer: string | null;
  browser: string | null;
  operating_system: string | null;
  device_type: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  properties: string; // JSON string containing error details
};

// Parsed error properties for easier use in components
export type ParsedErrorProperties = {
  message: string;
  stack?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
  [key: string]: any;
};

// This should match the paginated response structure from getErrorEvents.ts
export type ErrorEventsPaginatedResponse = {
  data: ErrorEvent[];
  totalCount: number;
};

// This is for non-paginated use
export type ErrorEventsStandardResponse = ErrorEvent[];

type UseGetErrorEventsOptions = {
  errorMessage: string;
  limit?: number;
  page?: number;
  useFilters?: boolean;
  enabled?: boolean;
};

// Hook for paginated fetching
export function useGetErrorEventsPaginated({
  errorMessage,
  limit = 20,
  page = 1,
  useFilters = true,
  enabled = true,
}: UseGetErrorEventsOptions): UseQueryResult<
  APIResponse<ErrorEventsPaginatedResponse>
> {
  const { time, site, filters } = useStore();

  const queryParams = {
    ...getQueryParams(time),
    errorMessage,
    limit,
    page,
    filters: useFilters ? filters : undefined,
  };

  return useQuery({
    queryKey: ["error-events", time, site, filters, errorMessage, limit, page],
    queryFn: () => {
      return authedFetch<APIResponse<ErrorEventsPaginatedResponse>>(
        `/error-events/${site}`,
        queryParams
      );
    },
    enabled: enabled && !!errorMessage && !!site,
    staleTime: Infinity,
  });
}

// Hook for standard (non-paginated) fetching
export function useGetErrorEvents({
  errorMessage,
  limit = 20,
  useFilters = true,
  enabled = true,
}: Omit<UseGetErrorEventsOptions, "page">): UseQueryResult<
  APIResponse<ErrorEventsStandardResponse>
> {
  const { time, site, filters } = useStore();

  const queryParams = {
    ...getQueryParams(time),
    errorMessage,
    limit,
    filters: useFilters ? filters : undefined,
  };

  return useQuery({
    queryKey: ["error-events", time, site, filters, errorMessage, limit],
    queryFn: () => {
      return authedFetch<APIResponse<ErrorEventsStandardResponse>>(
        `/error-events/${site}`,
        queryParams
      );
    },
    enabled: enabled && !!errorMessage && !!site,
    staleTime: Infinity,
  });
}

// Helper function to parse error properties JSON
export function parseErrorProperties(
  propertiesJson: string
): ParsedErrorProperties {
  try {
    const parsed = JSON.parse(propertiesJson);

    // Normalize property names to camelCase for backwards compatibility
    const normalized: ParsedErrorProperties = {
      message: parsed.message,
      stack: parsed.stack,
      fileName: parsed.fileName || parsed.filename,
      lineNumber: parsed.lineNumber || parsed.lineno,
      columnNumber: parsed.columnNumber || parsed.colno,
    };

    // Copy any other properties
    for (const key in parsed) {
      if (
        ![
          "message",
          "stack",
          "fileName",
          "filename",
          "lineNumber",
          "lineno",
          "columnNumber",
          "colno",
        ].includes(key)
      ) {
        normalized[key] = parsed[key];
      }
    }

    return normalized;
  } catch (e) {
    return { message: "Failed to parse error properties" };
  }
}
