"use client";
import { Card, CardContent, CardLoader } from "@/components/ui/card";
import { Tilt_Warp } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useGetOverview } from "../../../../../api/analytics/useGetOverview";
import {
  useGetOverviewBucketed,
  useGetOverviewBucketedPastMinutes,
  useGetOverviewBucketedPreviousPastMinutes,
} from "../../../../../api/analytics/useGetOverviewBucketed";
import { authClient } from "../../../../../lib/auth";
import { useStore } from "../../../../../lib/store";
import { cn } from "../../../../../lib/utils";
import { BucketSelection } from "../../../../../components/BucketSelection";
import { Chart } from "./Chart";
import { Overview } from "./Overview";
import { PreviousChart } from "./PreviousChart";

const SELECTED_STAT_MAP = {
  pageviews: "Pageviews",
  sessions: "Sessions",
  pages_per_session: "Pages per Session",
  bounce_rate: "Bounce Rate",
  session_duration: "Session Duration",
  users: "Users",
};

const tilt_wrap = Tilt_Warp({
  subsets: ["latin"],
  weight: "400",
});

export function MainSection() {
  const session = authClient.useSession();

  const { selectedStat, time, site, bucket } = useStore();

  // Use the past minutes API when in last-24-hours mode
  const isPast24HoursMode = time.mode === "last-24-hours";

  // Regular date-based queries
  const {
    data: regularData,
    isFetching: isRegularFetching,
    error: regularError,
  } = useGetOverviewBucketed({
    site,
    bucket,
    props: {
      enabled: !isPast24HoursMode,
    },
  });

  const {
    data: regularPreviousData,
    isFetching: isRegularPreviousFetching,
    error: regularPreviousError,
  } = useGetOverviewBucketed({
    periodTime: "previous",
    site,
    bucket,
    props: {
      enabled: !isPast24HoursMode,
    },
  });

  // Past minutes-based queries (for 24 hour mode)
  const {
    data: pastMinutesData,
    isFetching: isPastMinutesFetching,
    error: pastMinutesError,
  } = useGetOverviewBucketedPastMinutes({
    pastMinutesStart: 24 * 60,
    pastMinutesEnd: 0,
    site,
    bucket,
    props: {
      enabled: isPast24HoursMode,
    },
  });

  const {
    data: pastMinutesPreviousData,
    isFetching: isPastMinutesPreviousFetching,
    error: pastMinutesPreviousError,
  } = useGetOverviewBucketedPreviousPastMinutes({
    pastMinutesStart: 48 * 60,
    pastMinutesEnd: 24 * 60,
    site,
    bucket,
    props: {
      enabled: isPast24HoursMode,
    },
  });

  // Combine the data based on the mode
  const data = isPast24HoursMode ? pastMinutesData : regularData;
  const previousData = isPast24HoursMode
    ? pastMinutesPreviousData
    : regularPreviousData;
  const isFetching = isPast24HoursMode
    ? isPastMinutesFetching
    : isRegularFetching;
  const isPreviousFetching = isPast24HoursMode
    ? isPastMinutesPreviousFetching
    : isRegularPreviousFetching;

  const { isFetching: isOverviewFetching } = useGetOverview({ site });
  const { isFetching: isOverviewFetchingPrevious } = useGetOverview({
    site,
    periodTime: "previous",
  });

  const maxOfDataAndPreviousData = Math.max(
    Math.max(...(data?.data?.map((d: any) => d[selectedStat]) ?? [])),
    Math.max(...(previousData?.data?.map((d: any) => d[selectedStat]) ?? []))
  );

  return (
    <>
      <Card>
        <CardContent className="p-0 w-full">
          <Overview />
        </CardContent>
        {(isOverviewFetching || isOverviewFetchingPrevious) && <CardLoader />}
      </Card>
      <Card>
        {(isFetching || isPreviousFetching) && <CardLoader />}
        <CardContent className="p-2 md:p-4 py-3 w-full">
          <div className="flex items-center justify-between px-2 md:px-0">
            <div className="flex items-center space-x-4">
              <Link
                href={session.data ? "/" : "https://rybbit.io"}
                className={cn(
                  "text-lg font-semibold flex items-center gap-1.5 opacity-75",
                  tilt_wrap.className
                )}
              >
                <Image src="/rybbit.png" alt="Rybbit" width={20} height={20} />
                rybbit.io
              </Link>
            </div>
            <span className="text-sm text-neutral-200">
              {SELECTED_STAT_MAP[selectedStat]}
            </span>
            <BucketSelection />
          </div>
          <div className="h-[200px] md:h-[290px] relative">
            <div className="absolute top-0 left-0 w-full h-full">
              <PreviousChart
                data={previousData}
                max={maxOfDataAndPreviousData}
              />
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              <Chart
                data={data}
                max={maxOfDataAndPreviousData}
                previousData={
                  time.mode === "all-time" ? undefined : previousData
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
