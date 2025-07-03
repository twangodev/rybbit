"use client";

import { useMeasure } from "@uidotdev/usehooks";
import { useGetSessionReplays } from "../../../api/analytics/sessionReplay/useGetSessionReplays";
import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SESSION_REPLAY_PAGE_FILTERS } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { EnableSessionReplay } from "./components/EnableSessionReplay";
import { ReplayList } from "./components/ReplayList";
import { ReplayPlayer } from "./components/player/ReplayPlayer";
import { NothingFound } from "../../../components/NothingFound";
import { ReplayBreadcrumbs } from "./components/ReplayBreadcrumbs";
import { useReplayStore } from "./components/replayStore";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";

export default function SessionReplayPage() {
  useSetPageTitle("Rybbit · Session Replay");

  const { minDuration } = useReplayStore();

  const { data, isLoading } = useGetSessionReplays({ minDuration });

  const hasNoReplays = !isLoading && !data?.pages[0].data?.length;

  const [ref, { height: resolvedHeight, width: resolvedWidth }] = useMeasure();

  return (
    <>
      <div className="p-2 md:p-4 max-w-[2000px] mx-auto flex flex-col gap-1 overflow-y-hidden">
        <Alert className="mb-4 bg-amber-50/50 border-amber-200/50 dark:bg-amber-900/10 dark:border-amber-800/50">
          <AlertTitle className="text-amber-700/90 dark:text-amber-400/90 text-base font-semibold mb-1">
            Session Replay Unavailable
          </AlertTitle>
          <AlertDescription className="text-amber-700/80 dark:text-amber-400/80 text-sm">
            Due to high demand, we have temporarily disabled session replay. We
            are working on a solution and will update you as soon as it is
            available.
          </AlertDescription>
        </Alert>
        <SubHeader availableFilters={SESSION_REPLAY_PAGE_FILTERS} />
        <EnableSessionReplay />
        {hasNoReplays ? (
          <NothingFound
            title={"No session replays found"}
            description={
              "Replays will appear here once session replay is enabled."
            }
          />
        ) : (
          <div className="grid grid-cols-[200px_1fr_300px] gap-3">
            <ReplayList />
            <div ref={ref} className="w-[calc(min(100vw, 2000px)-780px)]">
              {resolvedWidth && resolvedHeight && (
                <ReplayPlayer
                  width={resolvedWidth}
                  height={resolvedHeight - 1}
                />
              )}
            </div>
            <ReplayBreadcrumbs />
          </div>
        )}
      </div>
    </>
  );
}
