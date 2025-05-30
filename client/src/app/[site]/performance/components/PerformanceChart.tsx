"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveLine } from "@nivo/line";
import { DateTime } from "luxon";
import { PerformanceMetric, useStore } from "../../../../lib/store";
import { useGetPerformanceTimeSeries } from "../../../../api/analytics/useGetPerformanceTimeSeries";
import { userLocale, hour12 } from "../../../../lib/dateTimeUtils";
import { nivoTheme } from "@/lib/nivo";

const METRIC_LABELS: Record<PerformanceMetric, string> = {
  lcp: "Largest Contentful Paint",
  cls: "Cumulative Layout Shift",
  inp: "Interaction to Next Paint",
  fcp: "First Contentful Paint",
  ttfb: "Time to First Byte",
};

const getMetricUnit = (metric: PerformanceMetric, value: number): string => {
  if (metric === "cls") return "";
  if (value >= 1000) return "s";
  return "ms";
};

const formatMetricValue = (
  metric: PerformanceMetric,
  value: number
): string => {
  if (metric === "cls") {
    return value.toFixed(3);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2);
  }
  return Math.round(value).toString();
};

// Performance metric thresholds for color coding
const getMetricColor = (metric: PerformanceMetric): string => {
  switch (metric) {
    case "lcp":
      return "#3b82f6"; // blue
    case "cls":
      return "#10b981"; // emerald
    case "inp":
      return "#f59e0b"; // amber
    case "fcp":
      return "#8b5cf6"; // violet
    case "ttfb":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

export function PerformanceChart() {
  const { site, selectedPerformanceMetric, bucket } = useStore();

  const { data: timeSeriesData, isLoading } = useGetPerformanceTimeSeries({
    site,
  });

  const chartData =
    timeSeriesData?.data
      ?.map((item: any) => {
        // Parse timestamp properly using luxon (same as Chart.tsx)
        const timestamp = DateTime.fromSQL(item.time).toUTC();

        // Filter out dates from the future
        if (timestamp > DateTime.now()) {
          return null;
        }

        // Get the p75 percentile value for the selected metric
        // Note: Using p75 as a good balance between median (p50) and outliers (p90/p99)
        // The API returns percentile data like: lcp_p50, lcp_p75, lcp_p90, lcp_p99
        const metricValue = item[`${selectedPerformanceMetric}_p75`] ?? 0;

        return {
          x: timestamp.toFormat("yyyy-MM-dd HH:mm:ss"),
          y: metricValue,
        };
      })
      .filter((e) => e !== null) ?? [];

  const data = [
    {
      id: selectedPerformanceMetric,
      color: getMetricColor(selectedPerformanceMetric),
      data: chartData,
    },
  ];

  const formatXAxisValue = (value: any) => {
    const dt = DateTime.fromJSDate(value).setLocale(userLocale);
    if (
      bucket === "hour" ||
      bucket === "minute" ||
      bucket === "five_minutes" ||
      bucket === "ten_minutes" ||
      bucket === "fifteen_minutes"
    ) {
      return dt.toFormat(hour12 ? "ha" : "HH:mm");
    }
    return dt.toFormat(hour12 ? "MMM d" : "dd MMM");
  };

  const formatTooltipValue = (value: number) => {
    return `${formatMetricValue(
      selectedPerformanceMetric,
      value
    )}${getMetricUnit(selectedPerformanceMetric, value)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {METRIC_LABELS[selectedPerformanceMetric]} Over Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="w-full h-[300px] rounded-md" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <p className="text-lg font-medium">
                No performance data available
              </p>
              <p className="text-sm">
                Try adjusting your date range or filters
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveLine
              data={data}
              theme={nivoTheme}
              margin={{ top: 10, right: 10, bottom: 25, left: 35 }}
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
              enableGridY={true}
              gridYValues={5}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                truncateTickAt: 0,
                format: formatXAxisValue,
              }}
              axisLeft={{
                tickSize: 0,
                tickPadding: 10,
                tickRotation: 0,
                truncateTickAt: 0,
                tickValues: 5,
                format: (value) =>
                  formatMetricValue(selectedPerformanceMetric, value),
              }}
              colors={[getMetricColor(selectedPerformanceMetric)]}
              enableTouchCrosshair={true}
              enablePoints={false}
              useMesh={true}
              animate={false}
              enableSlices="x"
              enableArea={true}
              areaBaselineValue={0}
              areaOpacity={0.3}
              sliceTooltip={({ slice }: any) => {
                const currentY = Number(slice.points[0].data.yFormatted);
                const currentTime = DateTime.fromJSDate(
                  new Date(slice.points[0].data.x)
                );

                const formatDateTime = (dt: DateTime) => {
                  const options: Intl.DateTimeFormatOptions = {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    hour12: hour12,
                  };
                  if (
                    bucket === "hour" ||
                    bucket === "minute" ||
                    bucket === "five_minutes" ||
                    bucket === "ten_minutes" ||
                    bucket === "fifteen_minutes"
                  ) {
                    if (!hour12) {
                      options.minute = "numeric";
                    }
                  }
                  return new Intl.DateTimeFormat(userLocale, options).format(
                    dt.toJSDate()
                  );
                };

                return (
                  <div className="text-sm bg-neutral-900 p-2 rounded-md">
                    <div className="flex justify-between text-sm w-36">
                      <div>{formatDateTime(currentTime)}</div>
                      <div>{formatTooltipValue(currentY)}</div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
