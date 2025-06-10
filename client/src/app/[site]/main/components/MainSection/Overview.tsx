"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatSecondsAsMinutesAndSeconds } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useGetOverview } from "../../../../../api/analytics/useGetOverview";
import { useGetOverviewBucketed } from "../../../../../api/analytics/useGetOverviewBucketed";
import { StatType, useStore } from "../../../../../lib/store";
import { SparklinesChart } from "./SparklinesChart";

const ChangePercentage = ({
  current,
  previous,
  reverseColor,
}: {
  current: number;
  previous: number;
  reverseColor?: boolean;
}) => {
  const change = ((current - previous) / previous) * 100;

  if (previous === 0) {
    if (current === 0) {
      return <div className="text-sm">0%</div>;
    }
    return <div className="text-sm">+999%</div>;
  }

  if (change === 0) {
    return <div className="text-sm">0%</div>;
  }

  return (
    <div
      className={cn(
        "text-xs flex items-center gap-1",
        (reverseColor ? -change : change) > 0
          ? "text-green-400"
          : "text-red-400"
      )}
    >
      {change > 0 ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      {Math.abs(change).toFixed(1)}%
    </div>
  );
};

const Stat = ({
  title,
  id,
  value,
  previous,
  valueFormatter,
  isLoading,
  decimals,
  postfix,
  reverseColor,
}: {
  title: string;
  id: StatType;
  value: number;
  previous: number;
  valueFormatter?: (value: number) => string;
  isLoading: boolean;
  decimals?: number;
  postfix?: string;
  reverseColor?: boolean;
}) => {
  const { selectedStat, setSelectedStat, site, bucket, time } = useStore();
  const [isHovering, setIsHovering] = useState(false);
  const isPast24HoursMode = time.mode === "last-24-hours";

  // Consolidated bucketed data for sparklines - automatically handles both modes
  const { data } = useGetOverviewBucketed({
    site,
    bucket,
    // For past-24-hours mode, use custom past minutes; otherwise use regular time-based approach
    ...(isPast24HoursMode && {
      pastMinutesStart: 24 * 60,
      pastMinutesEnd: 0,
    }),
  });

  // Filter and format sparklines data
  const sparklinesData =
    data?.data
      ?.filter((d) => {
        // For last-24-hours mode, ensure we only show data within the last 24 hours
        if (isPast24HoursMode) {
          const timestamp = new Date(d.time);
          const now = new Date();
          const twentyFourHoursAgo = new Date(
            now.getTime() - 24 * 60 * 60 * 1000
          );
          return timestamp >= twentyFourHoursAgo && timestamp <= now;
        }
        return true;
      })
      .map((d: any) => ({
        value: d[id],
        time: d.time,
      })) ?? [];

  return (
    <div
      className={cn(
        "flex flex-col cursor-pointer border-r border-neutral-800 last:border-r-0 text-nowrap",
        selectedStat === id && "bg-neutral-850"
      )}
      onClick={() => setSelectedStat(id)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex flex-col px-3 py-2">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-2xl font-medium flex gap-2 items-center justify-between">
          {isLoading ? (
            <>
              <Skeleton className="w-[60px] h-9 rounded-md" />
              <Skeleton className="w-[50px] h-5 rounded-md" />
            </>
          ) : (
            <>
              {valueFormatter ? (
                valueFormatter(value)
              ) : (
                <span>
                  {
                    <NumberFlow
                      respectMotionPreference={false}
                      value={decimals ? Number(value.toFixed(decimals)) : value}
                      format={{ notation: "compact" }}
                    />
                  }
                  {postfix && <span>{postfix}</span>}
                </span>
              )}
              <ChangePercentage
                current={value}
                previous={previous}
                reverseColor={reverseColor}
              />
            </>
          )}
        </div>
      </div>
      <div className="h-[40px] mt-[-16]">
        <SparklinesChart data={sparklinesData} isHovering={isHovering} />
      </div>
    </div>
  );
};

export function Overview() {
  const { site, time } = useStore();
  const isPast24HoursMode = time.mode === "last-24-hours";

  // Current period - automatically handles both regular time-based and past-minutes queries
  const {
    data: overviewData,
    isFetching: isOverviewFetching,
    isLoading: isOverviewLoading,
    error: overviewError,
  } = useGetOverview({
    site,
    // For past-24-hours mode, use custom past minutes; otherwise use regular time-based approach
    ...(isPast24HoursMode && {
      pastMinutesStart: 24 * 60,
      pastMinutesEnd: 0,
    }),
  });

  // Previous period - automatically handles both regular time-based and past-minutes queries
  const { data: overviewDataPrevious, isLoading: isOverviewLoadingPrevious } =
    useGetOverview({
      site,
      // For past-24-hours mode, use previous 24-hour period; otherwise use regular previous period
      ...(isPast24HoursMode
        ? {
            pastMinutesStart: 48 * 60,
            pastMinutesEnd: 24 * 60,
          }
        : {
            periodTime: "previous",
          }),
    });

  const isLoading = isOverviewLoading || isOverviewLoadingPrevious;

  const currentUsers = overviewData?.data?.users ?? 0;
  const previousUsers = overviewDataPrevious?.data?.users ?? 0;

  const currentSessions = overviewData?.data?.sessions ?? 0;
  const previousSessions = overviewDataPrevious?.data?.sessions ?? 0;

  const currentPageviews = overviewData?.data?.pageviews ?? 0;
  const previousPageviews = overviewDataPrevious?.data?.pageviews ?? 0;

  const currentPagesPerSession = overviewData?.data?.pages_per_session ?? 0;
  const previousPagesPerSession =
    overviewDataPrevious?.data?.pages_per_session ?? 0;

  const currentBounceRate = overviewData?.data?.bounce_rate ?? 0;
  const previousBounceRate = overviewDataPrevious?.data?.bounce_rate ?? 0;

  const currentSessionDuration = overviewData?.data?.session_duration ?? 0;
  const previousSessionDuration =
    overviewDataPrevious?.data?.session_duration ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 items-center">
      <Stat
        title="Unique Users"
        id="users"
        value={currentUsers}
        previous={previousUsers}
        isLoading={isLoading}
      />
      <Stat
        title="Sessions"
        id="sessions"
        value={currentSessions}
        previous={previousSessions}
        isLoading={isLoading}
      />
      <Stat
        title="Pageviews"
        id="pageviews"
        value={currentPageviews}
        previous={previousPageviews}
        isLoading={isLoading}
      />
      <Stat
        title="Pages per Session"
        id="pages_per_session"
        value={currentPagesPerSession}
        previous={previousPagesPerSession}
        decimals={1}
        isLoading={isLoading}
      />
      <Stat
        title="Bounce Rate"
        id="bounce_rate"
        value={currentBounceRate}
        previous={previousBounceRate}
        isLoading={isLoading}
        postfix="%"
        decimals={1}
        reverseColor={true}
      />
      <Stat
        title="Session Duration"
        id="session_duration"
        value={currentSessionDuration}
        previous={previousSessionDuration}
        isLoading={isLoading}
        valueFormatter={formatSecondsAsMinutesAndSeconds}
      />
    </div>
  );
}
