"use client";

import { useGetSite } from "@/api/admin/sites";
import { Card, CardContent } from "@/components/ui/card";
import { truncateString } from "@/lib/utils";
import { useState } from "react";
import { Filter, useStore } from "@/lib/store";
import {
  useGetOverviewBucketed,
  useGetOverviewBucketedPastMinutes,
} from "@/api/analytics/useGetOverviewBucketed";
import { SingleColResponse } from "@/api/analytics/useSingleCol";
import { ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "@/lib/nivo";
import { DateTime } from "luxon";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

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
  const { data: siteMetadata } = useGetSite();
  const { site, time, bucket } = useStore(); // Get time and bucket from store

  const isPast24HoursMode = time.mode === "last-24-hours";

  // Create a pathname filter for this specific page
  const pageSpecificFilter: Filter = {
    parameter: "pathname",
    value: [pageData.value],
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

  // Format the chart data
  const sparklineData = pageTrafficData?.data
    ?.filter((e: any) => {
      // Filter out dates from the future
      return DateTime.fromSQL(e.time).toUTC() <= DateTime.now();
    })
    .map((e: any) => ({
      x: DateTime.fromSQL(e.time).toUTC().toFormat("yyyy-MM-dd HH:mm:ss"),
      y: e.sessions || 0,
    }));

  // External URL for the page
  const pageUrl = siteMetadata?.domain
    ? `https://${siteMetadata.domain}${pageData.value}`
    : "";

  return (
    <Card
      className="w-full mb-3"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-4">
          {/* Left side: Page title/path */}
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

          {/* Right side: Sparkline chart and session count */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Sparkline chart */}
            <div className="h-16 w-48">
              {isLoadingTrafficData ? (
                <div className="h-full w-full flex items-center justify-center animate-pulse">
                  <div className="h-[1px] w-full bg-border opacity-50"></div>
                </div>
              ) : sparklineData && sparklineData.length > 0 ? (
                <ResponsiveLine
                  data={[{ id: pageData.value, data: sparklineData }]}
                  theme={nivoTheme}
                  margin={{ top: 5, right: 0, bottom: 0, left: 0 }}
                  xScale={{
                    type: "time",
                    format: "%Y-%m-%d %H:%M:%S",
                    precision: "second",
                    useUTC: true,
                  }}
                  yScale={{
                    type: "linear",
                    min: 0,
                    stacked: false,
                    reverse: false,
                  }}
                  enableGridX={false}
                  enableGridY={false}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={null}
                  axisLeft={null}
                  enableTouchCrosshair={true}
                  enablePoints={false}
                  useMesh={true}
                  animate={false}
                  enableSlices={"x"}
                  colors={[
                    isHovering
                      ? "hsl(var(--dataviz-2))"
                      : "hsl(var(--dataviz))",
                  ]}
                  enableArea={true}
                  areaBaselineValue={0}
                  areaOpacity={0.3}
                  curve="monotoneX"
                  defs={[
                    {
                      id: "gradient",
                      type: "linearGradient",
                      colors: [
                        { offset: 0, color: "hsl(var(--dataviz))", opacity: 1 },
                        {
                          offset: 100,
                          color: "hsl(var(--dataviz))",
                          opacity: 0,
                        },
                      ],
                    },
                  ]}
                  fill={[{ match: () => true, id: "gradient" }]}
                  sliceTooltip={() => null}
                  enableCrosshair={false}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <div className="h-[1px] w-full bg-border opacity-50"></div>
                </div>
              )}
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
