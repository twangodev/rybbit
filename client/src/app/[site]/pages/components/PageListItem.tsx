"use client";

import { useGetSite } from "@/api/admin/sites";
import {
  useGetOverviewBucketed,
  useGetOverviewBucketedPastMinutes,
} from "@/api/analytics/useGetOverviewBucketed";
import { SingleColResponse } from "@/api/analytics/useSingleCol";
import { usePageMetadata } from "@/api/usePageMetadata";
import { Card, CardContent } from "@/components/ui/card";
import { Filter, useStore } from "@/lib/store";
import { truncateString } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageSparklineChart } from "./PageSparklineChart";

// Maximum length for page titles
const MAX_TITLE_LENGTH = 70;

type PageListItemProps = {
  pageData: SingleColResponse;
  isLoading?: boolean;
};

export function PageListItem({
  pageData,
  isLoading = false,
}: PageListItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const { data: siteMetadata } = useGetSite();
  const { site, time, bucket } = useStore(); // Get time and bucket from store

  const isPast24HoursMode = time.mode === "last-24-hours";

  // Create a pathname filter for this specific page
  const pageSpecificFilter: Filter = {
    parameter: "page_title",
    value: [pageData.title ?? ""],
    type: "equals",
  };

  // Regular bucketed data for sparklines
  const { data: regularData, isLoading: isLoadingRegular } =
    useGetOverviewBucketed({
      site,
      bucket,
      dynamicFilters: [pageSpecificFilter],
      props: {
        enabled: !isPast24HoursMode,
      },
    });

  // Past minutes data for sparklines
  const { data: pastMinutesData, isLoading: isLoadingPastMinutes } =
    useGetOverviewBucketedPastMinutes({
      pastMinutes: 24 * 60,
      site,
      bucket,
      dynamicFilters: [pageSpecificFilter],
      props: {
        enabled: isPast24HoursMode,
      },
    });

  // Use the appropriate data source based on mode
  const pageTrafficData = isPast24HoursMode ? pastMinutesData : regularData;
  const isLoadingTrafficData = isPast24HoursMode
    ? isLoadingPastMinutes
    : isLoadingRegular;

  // External URL for the page
  const pageUrl = siteMetadata?.domain
    ? `https://${siteMetadata.domain}${pageData.value}`
    : "";

  // Fetch page metadata using TanStack Query
  const {
    data: metadata,
    isLoading: isLoadingMetadata,
    isError: isMetadataError,
  } = usePageMetadata(pageUrl);

  // Get thumbnail URL from metadata
  const thumbnailUrl =
    !thumbnailError && !isMetadataError ? metadata?.image : null;

  // Handle image error
  const handleImageError = () => {
    setThumbnailError(true);
  };

  return (
    <Card
      className="w-full mb-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
          {/* Left side: Page title/path with thumbnail */}
          <div className="flex gap-3 flex-1 min-w-0">
            {thumbnailUrl && !isLoadingMetadata && (
              <div className="hidden sm:block flex-shrink-0 h-16 w-24 relative rounded-md overflow-hidden border border-neutral-800">
                <img
                  src={thumbnailUrl}
                  alt={`Thumbnail for ${pageData.title || pageData.value}`}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium truncate">
                  {truncateString(
                    pageData.title || pageData.value,
                    MAX_TITLE_LENGTH
                  )}
                </h3>
                {pageUrl && (
                  <Link
                    href={pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {pageData.value}
              </p>
            </div>
          </div>

          {/* Right side: Sparkline chart and session count */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Sparkline chart */}
            <div className="h-16 w-48">
              <PageSparklineChart
                data={pageTrafficData}
                isHovering={isHovering}
                pageTitle={pageData.title || pageData.value}
                isLoading={isLoadingTrafficData}
              />
            </div>

            {/* Session count */}
            <div className="text-right min-w-[80px]">
              <div className="text-xl font-semibold">
                {pageData.count.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">sessions</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
