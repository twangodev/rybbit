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

export function ReplayList() {
  const params = useParams();
  const siteId = Number(params.site);
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
    <div ref={containerRef} className="space-y-2">
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
          <ReplayCard
            key={`${replay.session_id}-${index}`}
            replay={replay}
            siteId={siteId}
          />
        ))
      )}

      {isFetchingNextPage &&
        Array.from({ length: 10 }).map((_, index) => (
          <ReplayCardSkeleton key={`loading-more-${index}`} />
        ))}

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
