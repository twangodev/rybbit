"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveLine } from "@nivo/line";
import { DateTime } from "luxon";
import { PerformanceMetric, useStore } from "../../../../lib/store";
import { useGetPerformanceTimeSeries } from "../../../../api/analytics/useGetPerformanceTimeSeries";
import { userLocale, hour12 } from "../../../../lib/dateTimeUtils";

const METRIC_LABELS: Record<PerformanceMetric, string> = {
  lcp: "Largest Contentful Paint",
  cls: "Cumulative Layout Shift",
  inp: "Interaction to Next Paint",
  fcp: "First Contentful Paint",
  ttfb: "Time to First Byte",
};

const getMetricUnit = (metric: PerformanceMetric): string => {
  if (metric === "cls") return "";
  return "ms";
};

const formatMetricValue = (
  metric: PerformanceMetric,
  value: number
): string => {
  if (metric === "cls") {
    return value.toFixed(3);
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
    )}${getMetricUnit(selectedPerformanceMetric)}`;
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
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
              xScale={{
                type: "time",
                format: "%Y-%m-%d %H:%M:%S",
                precision: "second",
                useUTC: true,
              }}
              xFormat="time:%Y-%m-%d %H:%M:%S"
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false,
                reverse: false,
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                format: formatXAxisValue,
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Time",
                legendOffset: 50,
                legendPosition: "middle",
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: `${
                  METRIC_LABELS[selectedPerformanceMetric]
                } (${getMetricUnit(selectedPerformanceMetric)})`,
                legendOffset: -60,
                legendPosition: "middle",
                format: (value) =>
                  formatMetricValue(selectedPerformanceMetric, value),
              }}
              colors={[getMetricColor(selectedPerformanceMetric)]}
              pointSize={4}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              pointLabelYOffset={-12}
              enableArea={true}
              areaOpacity={0.1}
              useMesh={true}
              enableSlices="x"
              theme={{
                background: "transparent",
                text: {
                  fontSize: 12,
                  fill: "#a1a1aa",
                },
                axis: {
                  domain: {
                    line: {
                      stroke: "#404040",
                      strokeWidth: 1,
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 12,
                      fill: "#a1a1aa",
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "#404040",
                      strokeWidth: 1,
                    },
                    text: {
                      fontSize: 11,
                      fill: "#a1a1aa",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "#262626",
                    strokeWidth: 1,
                  },
                },
                crosshair: {
                  line: {
                    stroke: "#a1a1aa",
                    strokeWidth: 1,
                    strokeOpacity: 0.35,
                  },
                },
                tooltip: {
                  container: {
                    background: "#171717",
                    color: "#a1a1aa",
                    fontSize: 12,
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #404040",
                  },
                },
              }}
              tooltip={({ point }) => {
                // Safely format the date with validation
                const formatTooltipDate = (dateValue: any): string => {
                  if (!dateValue) {
                    return "Invalid date";
                  }

                  try {
                    const dt = DateTime.fromJSDate(new Date(dateValue));
                    if (!dt.isValid) {
                      return "Invalid date";
                    }
                    return dt.toLocaleString(DateTime.DATETIME_MED);
                  } catch (error) {
                    console.warn(
                      "Error formatting tooltip date:",
                      dateValue,
                      error
                    );
                    return "Invalid date";
                  }
                };

                return (
                  <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg">
                    <div className="text-sm font-medium text-white">
                      {formatTooltipDate(point.data.x)}
                    </div>
                    <div className="text-sm text-neutral-300">
                      {METRIC_LABELS[selectedPerformanceMetric]}:{" "}
                      {formatTooltipValue(Number(point.data.y))}
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
