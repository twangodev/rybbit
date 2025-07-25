"use client";

import { useMonitorStats } from "@/api/uptime/monitors";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatChartDateTime, hour12, userLocale } from "@/lib/dateTimeUtils";
import { nivoTheme } from "@/lib/nivo";
import { cn } from "@/lib/utils";
import { ResponsiveLine } from "@nivo/line";
import { DateTime } from "luxon";
import { useState } from "react";
import { UptimeBucketSelection } from "./UptimeBucketSelection";
import { useUptimeStore } from "./uptimeStore";
import { getHoursFromTimeRange } from "./utils";

interface MonitorResponseTimeChartProps {
  monitorId: number;
  monitorType: "http" | "tcp";
}

// HTTP timing metrics with labels for stacked view
const HTTP_METRICS = [
  { key: "dns_time_ms", label: "DNS", color: "hsl(280, 70%, 60%)" },
  { key: "tcp_time_ms", label: "Connection", color: "hsl(220, 70%, 60%)" },
  { key: "tls_time_ms", label: "TLS Handshake", color: "hsl(160, 70%, 60%)" },
  { key: "transfer_time_ms", label: "Data Transfer", color: "hsl(40, 70%, 60%)" },
] as const;

const formatTooltipValue = (value: number) => {
  return `${Math.round(value)}ms`;
};

export function MonitorResponseTimeChart({ monitorId, monitorType }: MonitorResponseTimeChartProps) {
  const { timeRange, bucket, setBucket } = useUptimeStore();

  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(
    new Set(monitorType === "http" ? HTTP_METRICS.map((m) => m.key) : ["response_time_ms"])
  );

  const { data: statsData, isLoading } = useMonitorStats(monitorId, {
    hours: getHoursFromTimeRange(timeRange),
    bucket,
  });

  console.info(statsData);

  const toggleMetric = (metricKey: string) => {
    setVisibleMetrics((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(metricKey)) {
        newSet.delete(metricKey);
      } else {
        newSet.add(metricKey);
      }
      return newSet;
    });
  };

  // Process data for the chart
  const processedData =
    statsData?.distribution
      ?.map((item: any) => {
        const timestamp = DateTime.fromSQL(item.hour).toLocal();

        const dataPoint: any = {
          time: timestamp.toFormat("yyyy-MM-dd HH:mm:ss"),
          response_time_ms: item.avg_response_time,
        };

        // For HTTP monitors, include additional timing data
        if (monitorType === "http") {
          dataPoint.dns_time_ms = item.avg_dns_time || 0;
          dataPoint.tcp_time_ms = item.avg_tcp_time || 0;
          dataPoint.tls_time_ms = item.avg_tls_time || 0;
          dataPoint.ttfb_ms = item.avg_ttfb || 0;
          dataPoint.transfer_time_ms = item.avg_transfer_time || 0;
        }

        return dataPoint;
      })
      .filter((e: any) => e !== null) ?? [];

  // Create data series based on monitor type
  const createDataSeries = () => {
    if (monitorType === "tcp") {
      return [
        {
          id: "Response Time",
          color: "hsl(260, 70%, 50%)",
          data: processedData
            .map((item: any) => ({
              x: item.time,
              y: item.response_time_ms,
            }))
            .filter((point: any) => point.y !== null && point.y > 0),
        },
      ];
    }

    // For HTTP, show stacked timing metrics
    // Order matters for stacking - DNS first, then connection, TLS, and finally transfer
    return HTTP_METRICS.filter((metric) => visibleMetrics.has(metric.key)).map((metric) => ({
      id: metric.label,
      color: metric.color,
      data: processedData
        .map((item: any) => ({
          x: item.time,
          y: item[metric.key] || 0,
        }))
        .filter((point: any) => point.y !== null),
    }));
  };

  const data = createDataSeries();

  // Define gradients for stacked areas with lower opacity
  const defs =
    monitorType === "http"
      ? [
          {
            id: "gradientDNS",
            type: "linearGradient" as const,
            colors: [{ offset: 0, color: "hsl(280, 70%, 60%)", opacity: 0.1 }],
          },
          {
            id: "gradientConnection",
            type: "linearGradient" as const,
            colors: [{ offset: 0, color: "hsl(220, 70%, 60%)", opacity: 0.1 }],
          },
          {
            id: "gradientTLS",
            type: "linearGradient" as const,
            colors: [{ offset: 0, color: "hsl(160, 70%, 60%)", opacity: 0.1 }],
          },
          {
            id: "gradientTransfer",
            type: "linearGradient" as const,
            colors: [{ offset: 0, color: "hsl(40, 70%, 60%)", opacity: 0.1 }],
          },
        ]
      : [];

  const fill =
    monitorType === "http"
      ? [
          { match: { id: "DNS" }, id: "gradientDNS" },
          { match: { id: "Connection" }, id: "gradientConnection" },
          { match: { id: "TLS Handshake" }, id: "gradientTLS" },
          { match: { id: "Data Transfer" }, id: "gradientTransfer" },
        ]
      : [];

  const formatXAxisValue = (value: any) => {
    const dt = DateTime.fromJSDate(value).setLocale(userLocale);

    // Format based on bucket size
    switch (bucket) {
      case "minute":
      case "five_minutes":
      case "ten_minutes":
      case "fifteen_minutes":
        return dt.toFormat(hour12 ? "h:mma" : "HH:mm");
      case "hour":
        if (timeRange === "24h") {
          return dt.toFormat(hour12 ? "ha" : "HH:mm");
        }
        return dt.toFormat(hour12 ? "MMM d, ha" : "dd MMM, HH:mm");
      case "day":
        return dt.toFormat(hour12 ? "MMM d" : "dd MMM");
      case "week":
        return dt.toFormat("MMM d");
      case "month":
        return dt.toFormat("MMM yyyy");
      default:
        return dt.toFormat(hour12 ? "MMM d" : "dd MMM");
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Response Time</h3>

          <div className="flex items-center gap-4">
            {/* Metric toggles for HTTP monitors */}
            {monitorType === "http" && (
              <div className="flex items-center gap-2">
                {HTTP_METRICS.map((metric) => {
                  const isVisible = visibleMetrics.has(metric.key);
                  return (
                    <button
                      key={metric.key}
                      onClick={() => toggleMetric(metric.key)}
                      className={cn(
                        "flex items-center space-x-1.5 px-2 py-1 rounded text-xs font-medium transition-all",
                        isVisible
                          ? "bg-neutral-800 text-white"
                          : "bg-neutral-900 text-neutral-500 hover:text-neutral-400"
                      )}
                    >
                      <div
                        className={cn(
                          "w-3 h-3 rounded-sm transition-opacity",
                          isVisible ? "opacity-100" : "opacity-30"
                        )}
                        style={{ backgroundColor: metric.color }}
                      />
                      <span>{metric.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Time range and bucket selectors */}
            <div className="flex items-center gap-2">
              <UptimeBucketSelection timeRange={timeRange} bucket={bucket} onBucketChange={setBucket} />
            </div>
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="w-full h-[300px] rounded-md" />
        ) : data.length === 0 || data.every((series) => series.data.length === 0) ? (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center text-neutral-500">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">Try adjusting your time range</p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveLine
              data={data}
              theme={nivoTheme}
              margin={{ top: 10, right: 20, bottom: 25, left: 50 }}
              defs={defs}
              fill={fill}
              xScale={{
                type: "time",
                format: "%Y-%m-%d %H:%M:%S",
                precision: "second",
                useUTC: true,
              }}
              yScale={{
                type: "linear",
                min: 0,
                stacked: monitorType === "http",
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
                format: (value) => `${value}ms`,
              }}
              colors={(d) => d.color}
              enablePoints={false}
              useMesh={true}
              animate={false}
              enableSlices="x"
              enableArea={monitorType === "http"}
              areaOpacity={0.7}
              sliceTooltip={({ slice }: any) => {
                const currentTime = DateTime.fromJSDate(new Date(slice.points[0].data.x));

                // For stacked HTTP charts, show cumulative total
                const total =
                  monitorType === "http"
                    ? slice.points.reduce((sum: number, point: any) => sum + Number(point.data.yFormatted), 0)
                    : 0;

                return (
                  <div className="text-sm bg-neutral-850 p-3 rounded-md min-w-[200px] border border-neutral-750 text-neutral-200">
                    {formatChartDateTime(currentTime, bucket)}
                    <div className="space-y-1.5 mt-2 text-xs">
                      {slice.points.map((point: any) => (
                        <div key={point.seriesId} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: point.seriesColor }} />
                            <span className="text-neutral-300">{point.seriesId}</span>
                          </div>
                          <span className="text-neutral-200">{formatTooltipValue(Number(point.data.yFormatted))}</span>
                        </div>
                      ))}
                      {monitorType === "http" && (
                        <div className="flex justify-between items-center pt-1.5 border-t border-neutral-700">
                          <span className="text-neutral-300">Total</span>
                          <span className="text-white font-medium">{formatTooltipValue(total)}</span>
                        </div>
                      )}
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
