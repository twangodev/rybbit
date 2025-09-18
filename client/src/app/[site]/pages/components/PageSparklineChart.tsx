"use client";

import { GetOverviewBucketedResponse } from "@/api/analytics/useGetOverviewBucketed";
import { APIResponse } from "@/api/types";
import { hour12, userLocale } from "@/lib/dateTimeUtils";
import { nivoTheme } from "@/lib/nivo";
import { ResponsiveLine } from "@nivo/line";
import { DateTime } from "luxon";

interface PageSparklineChartProps {
  data: APIResponse<GetOverviewBucketedResponse> | undefined;
  isHovering: boolean;
  pageTitle: string;
  isLoading: boolean;
}

export function PageSparklineChart({ data, isHovering, pageTitle, isLoading }: PageSparklineChartProps) {
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center animate-pulse">
        <div className="h-[1px] w-full bg-border opacity-50"></div>
      </div>
    );
  }

  // Format the chart data
  const sparklineData = data?.data
    ?.filter(e => {
      // Filter out dates from the future
      return DateTime.fromSQL(e.time).toUTC() <= DateTime.now();
    })
    .map(e => ({
      x: DateTime.fromSQL(e.time).toUTC().toFormat("yyyy-MM-dd HH:mm:ss"),
      y: e.sessions || 0,
      time: DateTime.fromSQL(e.time).toUTC(),
    }));

  if (!sparklineData || sparklineData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="h-[1px] w-full bg-border opacity-50"></div>
      </div>
    );
  }

  return (
    <ResponsiveLine
      data={[{ id: pageTitle, data: sparklineData }]}
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
      colors={[isHovering ? "hsl(var(--dataviz-2))" : "hsl(var(--dataviz))"]}
      enableArea={true}
      areaBaselineValue={0}
      areaOpacity={0.3}
      curve="linear"
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
      sliceTooltip={({ slice }: any) => {
        const point = slice.points[0];
        const value = point.data.y;
        const timestamp = point.data.time as DateTime;

        return (
          <div className="text-sm bg-neutral-900 border border-neutral-700 p-2 rounded-md shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="text-neutral-200">{formatDateTime(timestamp)}</div>
              <div className="font-medium">{value.toLocaleString()}</div>
            </div>
          </div>
        );
      }}
    />
  );
}

const formatDateTime = (dt: DateTime) => {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: hour12,
  };

  return new Intl.DateTimeFormat(userLocale, options).format(dt.toJSDate());
};
