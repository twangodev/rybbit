"use client";

import NumberFlow from "@number-flow/react";
import { ExternalLink, Info } from "lucide-react";
import { DateTime } from "luxon";
import { memo } from "react";
import { OutboundLink } from "../../../../api/analytics/events/useGetOutboundLinks";
import { cn } from "../../../../lib/utils";

// Skeleton component for OutboundLinksList
const OutboundLinksListSkeleton = memo(({ size = "small" }: { size?: "small" | "large" }) => {
  // Generate widths following Pareto principle with top item at 100%
  const widths = Array.from({ length: 10 }, (_, i) => {
    if (i === 0) {
      return 100;
    } else if (i === 1) {
      return 60 + Math.random() * 20;
    } else {
      const factor = 1 - (i - 2) / 8;
      return 10 + factor * 30;
    }
  });

  const labelWidths = Array.from({ length: 10 }, (_, i) => {
    return i < 3 ? 150 + Math.random() * 100 : 80 + Math.random() * 120;
  });

  const valueWidths = Array.from({ length: 10 }, () => 20 + Math.random() * 40);

  return (
    <div className="flex flex-col gap-2 pr-2">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className={cn("relative flex items-center", size === "small" ? "h-6" : "h-9")}>
          <div
            className="absolute inset-0 bg-neutral-800 py-2 rounded-md animate-pulse"
            style={{ width: `${widths[index]}%` }}
          ></div>
          <div
            className={cn(
              "z-5 mx-2 flex justify-between items-center w-full",
              size === "small" ? "text-xs" : "text-sm"
            )}
          >
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-neutral-800 rounded animate-pulse mr-1"></div>
              <div
                className="h-4 bg-neutral-800 rounded animate-pulse"
                style={{ width: `${labelWidths[index]}px` }}
              ></div>
            </div>
            <div className={cn("flex gap-2", size === "small" ? "text-xs" : "text-sm")}>
              <div
                className="h-4 bg-neutral-800 rounded animate-pulse"
                style={{ width: `${valueWidths[index]}px` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

interface OutboundLinksListProps {
  outboundLinks: OutboundLink[];
  isLoading: boolean;
  size?: "small" | "large";
}

// Function to truncate URL for display
function truncateUrl(url: string, maxLength: number = 60) {
  if (!url) return "-";
  if (url.length <= maxLength) return url;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;

    if (domain.length + path.length <= maxLength) {
      return `${domain}${path}`;
    }

    // If still too long, truncate the path
    const availableSpace = maxLength - domain.length - 3; // 3 for "..."
    if (availableSpace > 0) {
      return `${domain}${path.substring(0, availableSpace)}...`;
    } else {
      return `${domain.substring(0, maxLength - 3)}...`;
    }
  } catch (e) {
    // If URL parsing fails, just truncate the string
    return `${url.substring(0, maxLength - 3)}...`;
  }
}

export function OutboundLinksList({ outboundLinks, isLoading, size = "small" }: OutboundLinksListProps) {
  if (isLoading) {
    return <OutboundLinksListSkeleton size={size} />;
  }

  if (!outboundLinks || outboundLinks.length === 0) {
    return (
      <div className="text-neutral-300 w-full text-center mt-6 flex flex-row gap-2 items-center justify-center">
        <Info className="w-5 h-5" />
        No Data
      </div>
    );
  }

  // Find the total count to calculate percentages
  const totalCount = outboundLinks.reduce((sum, link) => sum + link.count, 0);

  return (
    <div className="flex flex-col gap-2 pr-2 overflow-y-auto max-h-[60vh] h-auto lg:h-full lg:min-h-0 lg:max-h-full">
      {outboundLinks.map((link, index) => {
        const percentage = (link.count / totalCount) * 100;
        const lastClicked = DateTime.fromSQL(link.lastClicked, {
          zone: "utc",
        }).toLocal();

        return (
          <div
            key={`${link.url}-${index}`}
            className={cn(
              "relative flex items-center hover:bg-neutral-850 group px-2 rounded-md",
              size === "small" ? "h-6" : "h-9"
            )}
          >
            <div
              className="absolute inset-0 bg-dataviz py-2 opacity-25 rounded-md"
              style={{ width: `${percentage}%` }}
            ></div>
            <div
              className={cn("z-10 flex justify-between items-center w-full", size === "small" ? "text-xs" : "text-sm")}
            >
              <div className="font-medium truncate max-w-[70%] flex items-center gap-1">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-100 hover:underline truncate"
                  title={link.url}
                >
                  {truncateUrl(link.url)}
                </a>
              </div>
              <div className={cn("text-sm flex gap-2 items-center", size === "small" ? "text-xs" : "text-sm")}>
                <div className="hidden group-hover:block text-neutral-400 text-xs">
                  {Math.round(percentage * 10) / 10}%
                </div>
                <div className="hidden group-hover:block text-neutral-400 text-xs">{lastClicked.toRelative()}</div>
                <NumberFlow respectMotionPreference={false} value={link.count} format={{ notation: "compact" }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
