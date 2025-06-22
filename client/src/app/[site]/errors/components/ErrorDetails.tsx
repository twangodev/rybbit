"use client";

import {
  ErrorEvent,
  parseErrorProperties,
  useGetErrorEvents,
} from "@/api/analytics/errors/useGetErrorEvents";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { userLocale } from "@/lib/dateTimeUtils";
import { useGetRegionName } from "@/lib/geo";
import { getCountryName } from "@/lib/utils";
import {
  AlertTriangle,
  Code,
  Hash,
  Laptop,
  Smartphone,
  TriangleAlert,
  User,
} from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { memo } from "react";
import { Browser } from "../../components/shared/icons/Browser";
import { CountryFlag } from "../../components/shared/icons/CountryFlag";
import { OperatingSystem } from "../../components/shared/icons/OperatingSystem";

interface ErrorDetailsProps {
  errorMessage: string;
}

// DeviceIcon component for displaying mobile/desktop icons
function DeviceIcon({ deviceType }: { deviceType: string | null }) {
  if (!deviceType) return <Laptop className="w-4 h-4" />;

  const type = deviceType.toLowerCase();
  if (type.includes("mobile") || type.includes("tablet")) {
    return <Smartphone className="w-4 h-4" />;
  }
  return <Laptop className="w-4 h-4" />;
}

// Function to truncate text for display
function truncateText(text: string | null, maxLength: number = 50) {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}

// Component to display individual error event
function ErrorEventItem({ errorEvent }: { errorEvent: ErrorEvent }) {
  const { getRegionName } = useGetRegionName();
  const errorProps = parseErrorProperties(errorEvent.properties);

  const getFullLocation = (event: ErrorEvent) => {
    let location = "";
    if (event.city) {
      location += `${event.city}, `;
    }
    if (event.region && getRegionName(event.region)) {
      location += `${getRegionName(event.region)}, `;
    }
    if (event.country) {
      location += getCountryName(event.country);
    }
    return location || "Unknown location";
  };

  const formatTimestamp = (timestamp: string) => {
    return DateTime.fromSQL(timestamp, { zone: "utc" })
      .setLocale(userLocale)
      .toRelative();
  };

  return (
    <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/50">
      {/* Header with timestamp and basic info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-200">
            {formatTimestamp(errorEvent.timestamp)}
          </span>
          <div className="flex items-center gap-2">
            {errorEvent.country && (
              <Tooltip>
                <TooltipTrigger>
                  <CountryFlag country={errorEvent.country} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{getFullLocation(errorEvent)}</p>
                </TooltipContent>
              </Tooltip>
            )}
            {errorEvent.browser && (
              <Tooltip>
                <TooltipTrigger>
                  <Browser browser={errorEvent.browser} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {errorEvent.browser}
                    {errorEvent.browser_version &&
                      ` ${errorEvent.browser_version}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            {errorEvent.operating_system && (
              <Tooltip>
                <TooltipTrigger>
                  <OperatingSystem os={errorEvent.operating_system} />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {errorEvent.operating_system}
                    {errorEvent.operating_system_version &&
                      ` ${errorEvent.operating_system_version}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger>
                <DeviceIcon deviceType={errorEvent.device_type} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{errorEvent.device_type || "Unknown device"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Link
            href={`https://${errorEvent.hostname}${errorEvent.pathname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-300 break-words hover:underline"
          >
            {errorEvent.hostname && errorEvent.pathname
              ? `${errorEvent.hostname}${errorEvent.pathname}`
              : errorEvent.pathname || errorEvent.hostname || "Unknown page"}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {/* Session ID */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs">
                <Hash className="w-3 h-3 mr-1" />
                {errorEvent.session_id.substring(0, 8)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Session ID: {errorEvent.session_id}</TooltipContent>
          </Tooltip>

          {/* User ID if available */}
          {errorEvent.user_id && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  {errorEvent.user_id.substring(0, 8)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>User ID: {errorEvent.user_id}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Error message */}
      <div className="mb-3">
        <div className="flex items-start gap-2 text-red-400">
          <TriangleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium mb-1">Error</p>
            <p className="text-sm text-neutral-300 break-words">
              {errorProps.message || "No message available"}
            </p>
          </div>
        </div>
      </div>

      {/* Stack trace if available */}
      {errorProps.stack && (
        <div className="mt-3 pt-3 border-t border-neutral-700">
          <div className="flex items-start gap-2">
            <Code className="w-4 h-4 text-neutral-100 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-100 mb-1">
                Stack Trace:
              </p>
              {/* File and line info */}
              {(errorProps.fileName || errorProps.lineNumber) && (
                <div className="mb-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`${errorProps.fileName}`}
                      className="text-sm text-neutral-300 break-words hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {errorProps.fileName && (
                        <span>{truncateText(errorProps.fileName, 100)}</span>
                      )}
                      {errorProps.lineNumber && (
                        <span className="text-neutral-100">
                          :{errorProps.lineNumber}
                          {errorProps.columnNumber &&
                            `:${errorProps.columnNumber}`}
                        </span>
                      )}
                    </Link>
                  </div>
                </div>
              )}
              <pre className="text-xs text-neutral-100 bg-neutral-800 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                {errorProps.stack}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorDetails({ errorMessage }: ErrorDetailsProps) {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error,
  } = useGetErrorEvents({
    errorMessage,
    limit: 10, // Show latest 10 error events
    enabled: !!errorMessage,
  });

  const errorEvents: ErrorEvent[] | undefined = apiResponse?.data;

  if (isLoading) {
    return (
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="border border-neutral-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <div className="text-center text-red-400">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <p>Error loading error details</p>
          <p className="text-sm text-neutral-400">{error?.toString()}</p>
        </div>
      </div>
    );
  }

  if (!errorEvents || errorEvents.length === 0) {
    return (
      <div className="p-4 bg-neutral-900 border-t border-neutral-800">
        <div className="text-center text-neutral-400">
          <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
          <p>No error events found</p>
          <p className="text-sm">
            This error may have occurred outside the current time range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3 max-h-[70vh] overflow-y-auto">
      {errorEvents.map((errorEvent, index) => (
        <ErrorEventItem
          key={`${errorEvent.session_id}-${errorEvent.timestamp}-${index}`}
          errorEvent={errorEvent}
        />
      ))}
    </div>
  );
}

export const ErrorDetailsSkeleton = memo(() => {
  return (
    <div className="p-4 bg-neutral-900 border-t border-neutral-800">
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-3" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
