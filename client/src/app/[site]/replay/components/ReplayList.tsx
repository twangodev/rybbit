import { useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { NothingFound } from "../../../../components/NothingFound";
import { ReplayCard, ReplayCardSkeleton } from "./ReplayCard";
import {
  useGetSessionReplays,
  SessionReplayListItem,
} from "../../../../api/analytics/sessionReplay/useGetSessionReplays";
import { useReplayStore } from "./replayStore";
import { ScrollArea } from "../../../../components/ui/scroll-area";

export function ReplayList() {
  const { sessionId, setSessionId } = useReplayStore();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetSessionReplays();

  const flattenedData = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data || []);
  }, [data]);

  useEffect(() => {
    if (flattenedData.length > 0 && !sessionId) {
      setSessionId(flattenedData[0].session_id);
    }
  }, [flattenedData]);

  const containerRef = useRef<HTMLDivElement>(null);

  if (error) {
    return (
      <div className="text-red-500 p-4">Error: {(error as Error).message}</div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-130px)]">
      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-neutral-800"
      >
        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <ReplayCardSkeleton key={`loading-more-${index}`} />
          ))
        ) : flattenedData.length === 0 ? (
          <NothingFound
            title={"No session replays found"}
            description={"Try a different date range or filter"}
          />
        ) : (
          flattenedData.map((replay: SessionReplayListItem, index) => (
            <ReplayCard key={`${replay.session_id}-${index}`} replay={replay} />
          ))
        )}

        {isFetchingNextPage &&
          Array.from({ length: 10 }).map((_, index) => (
            <ReplayCardSkeleton key={`loading-more-${index}`} />
          ))}
      </div>

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
    </ScrollArea>
  );
}
