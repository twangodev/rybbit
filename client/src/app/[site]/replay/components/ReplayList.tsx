import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "../../../../components/ui/button";
import { NothingFound } from "../../../../components/NothingFound";
import { ReplayCard, ReplayCardSkeleton } from "./ReplayCard";
import { useStore } from "../../../../lib/store";
import { DateTime } from "luxon";

interface SessionReplayListItem {
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  pageUrl: string;
  eventCount: number;
  recordingStatus: string;
  country: string;
  browser: string;
  deviceType: string;
}

export default function ReplayList() {
  const params = useParams();
  const siteId = Number(params.site);
  const { datePickerRange } = useStore();

  const fetchReplays = async ({ pageParam = 0 }) => {
    const queryParams = new URLSearchParams({
      limit: "20",
      offset: String(pageParam),
      startDate: DateTime.fromJSDate(datePickerRange.from).toISO(),
      endDate: DateTime.fromJSDate(datePickerRange.to).toISO(),
    });

    const response = await fetch(
      `/api/session-replay/list/${siteId}?${queryParams}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch replays");
    }

    return response.json();
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["session-replays", siteId, datePickerRange],
    queryFn: fetchReplays,
    getNextPageParam: (lastPage, pages) => {
      const totalFetched = pages.reduce(
        (acc, page) => acc + (page.data?.length || 0),
        0
      );
      return lastPage.data?.length === 20 ? totalFetched : undefined;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const flattenedData = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data || []);
  }, [data]);

  const containerRef = useRef<HTMLDivElement>(null);

  if (error)
    return (
      <div className="text-red-500 p-4">Error: {(error as Error).message}</div>
    );

  return (
    <div ref={containerRef} className="space-y-4">
      {isLoading ? (
        <ReplayCardSkeleton />
      ) : flattenedData.length === 0 ? (
        <NothingFound
          title={"No session replays found"}
          description={"Try a different date range or filter"}
        />
      ) : (
        flattenedData.map((replay: SessionReplayListItem, index) => (
          <ReplayCard
            key={`${replay.sessionId}-${index}`}
            replay={replay}
            siteId={siteId}
          />
        ))
      )}

      {isFetchingNextPage && (
        <div className="">
          <ReplayCardSkeleton key="loading-more" />
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center py-2">
          <Button
            onClick={() => fetchNextPage()}
            className="w-full"
            variant="success"
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}