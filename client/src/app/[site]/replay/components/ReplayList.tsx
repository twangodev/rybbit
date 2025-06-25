import { useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { NothingFound } from "../../../../components/NothingFound";
import { ReplayCard, ReplayCardSkeleton } from "./ReplayCard";
import {
  useGetSessionReplays,
  SessionReplayListItem,
} from "../../../../api/analytics/sessionReplay/useGetSessionReplays";

export function ReplayList() {
  const params = useParams();
  const siteId = Number(params.site);

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
            key={`${replay.session_id}-${index}`}
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
