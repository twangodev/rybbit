"use client";
import { nivoTheme } from "@/lib/nivo";
import { ResponsiveLine } from "@nivo/line";
import { useWindowSize } from "@uidotdev/usehooks";
import { DateTime } from "luxon";
import { useGetOrgEventCount } from "../api/analytics/useGetOrgEventCount";
import { userLocale } from "../lib/dateTimeUtils";
import { formatter } from "../lib/utils";
import { Badge } from "./ui/badge";

interface UsageChartProps {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
}

export function UsageChart({ organizationId, startDate, endDate, timeZone = "UTC" }: UsageChartProps) {
  const { width } = useWindowSize();

  // Fetch the data inside the component
  const { data, isLoading, error } = useGetOrgEventCount({
    organizationId,
    startDate,
    endDate,
    timeZone,
    enabled: !!organizationId,
  });

  const maxTicks = Math.round((width ?? Infinity) / 200);

  const pageviewData =
    data?.data
      ?.map(e => {
        const timestamp = DateTime.fromSQL(e.event_date).toUTC();
        if (timestamp > DateTime.now()) return null;
        return {
          x: timestamp.toFormat("yyyy-MM-dd"),
          y: e.pageview_count,
          currentTime: timestamp,
        };
      })
      .filter(e => e !== null) || [];

  const customEventData =
    data?.data
      ?.map(e => {
        const timestamp = DateTime.fromSQL(e.event_date).toUTC();
        if (timestamp > DateTime.now()) return null;
        return {
          x: timestamp.toFormat("yyyy-MM-dd"),
          y: e.custom_event_count,
          currentTime: timestamp,
        };
      })
      .filter(e => e !== null) || [];

  const performanceData =
    data?.data
      ?.map(e => {
        const timestamp = DateTime.fromSQL(e.event_date).toUTC();
        if (timestamp > DateTime.now()) return null;
        return {
          x: timestamp.toFormat("yyyy-MM-dd"),
          y: e.performance_count,
          currentTime: timestamp,
        };
      })
      .filter(e => e !== null) || [];

  const chartData = [
    {
      id: "pageviews",
      data: pageviewData,
    },
    {
      id: "custom events",
      data: customEventData,
    },
    {
      id: "performance",
      data: performanceData,
    },
  ];

  const maxValue = Math.max(
    ...pageviewData.map(d => d.y),
    ...customEventData.map(d => d.y),
    ...performanceData.map(d => d.y),
    1
  );

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading usage data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Failed to load usage data</div>
      </div>
    );
  }

  const totalEvents = chartData.reduce((acc, curr) => acc + curr.data.reduce((acc, curr) => acc + curr.y, 0), 0);

  return (
    <div>
      <h3 className="font-medium text-sm text-neutral-300 mb-2 flex items-center gap-2 mb-4">
        Last 30 Days
        <Badge variant="outline" className="text-neutral-300">
          {totalEvents.toLocaleString()} events
        </Badge>
      </h3>
      <div className="h-48">
        <ResponsiveLine
          data={chartData}
          theme={nivoTheme}
          margin={{ top: 10, right: 10, bottom: 25, left: 35 }}
          xScale={{
            type: "time",
            format: "%Y-%m-%d",
            precision: "day",
            useUTC: true,
          }}
          yScale={{
            type: "linear",
            min: 0,
            stacked: false,
            reverse: false,
            max: maxValue,
          }}
          enableGridX={false}
          enableGridY={true}
          gridYValues={5}
          yFormat=" >-.0f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            truncateTickAt: 0,
            tickValues: Math.min(maxTicks, 10),
            format: value => {
              const dt = DateTime.fromJSDate(value).setLocale(userLocale);
              return dt.toFormat("MMM d");
            },
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            truncateTickAt: 0,
            tickValues: 5,
            format: formatter,
          }}
          enableTouchCrosshair={true}
          enablePoints={false}
          useMesh={true}
          animate={false}
          enableSlices={"x"}
          colors={["hsl(var(--blue-400))", "hsl(var(--indigo-400))", "hsl(var(--violet-400))"]}
          enableArea={false}
          sliceTooltip={({ slice }: any) => {
            const currentTime = slice.points[0].data.currentTime as DateTime;

            const total = slice.points.reduce((acc: number, point: any) => acc + Number(point.data.yFormatted), 0);

            return (
              <div className="text-sm bg-neutral-850 p-3 rounded-md min-w-[100px] border border-neutral-750">
                <div className="font-medium mb-1">{currentTime.toLocaleString(DateTime.DATE_MED)}</div>
                {slice.points.reverse().map((point: any) => {
                  return (
                    <div key={point.serieId} className="flex justify-between gap-4 text-sm">
                      <div className="flex items-center gap-2 text-neutral-300">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: point.seriesColor }} />
                        <span>{point.seriesId.charAt(0).toUpperCase() + point.seriesId.slice(1)}</span>
                      </div>
                      <div>{Number(point.data.yFormatted).toLocaleString()}</div>
                    </div>
                  );
                })}
                <div className="text-sm mt-2 flex justify-between">
                  <div className="text-neutral-300">Total</div>
                  <div className="font-semibold">{total.toLocaleString()}</div>
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
