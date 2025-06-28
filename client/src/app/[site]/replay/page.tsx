"use client";

import { useMeasure } from "@uidotdev/usehooks";
import { useGetSessionReplays } from "../../../api/analytics/sessionReplay/useGetSessionReplays";
import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SESSION_REPLAY_PAGE_FILTERS } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { EnableSessionReplay } from "./components/EnableSessionReplay";
import { ReplayList } from "./components/ReplayList";
import { ReplayPlayer } from "./components/ReplayPlayer";
import { NothingFound } from "../../../components/NothingFound";
import { ReplayBreadcrumbs } from "./components/ReplayBreadcrumbs";

export default function SessionReplayPage() {
  useSetPageTitle("Rybbit · Session Replay");

  const { data, isLoading } = useGetSessionReplays();

  const hasNoReplays = !isLoading && !data?.pages[0].data?.length;

  const [ref, { height: resolvedHeight, width: resolvedWidth }] = useMeasure();

  return (
    <DisabledOverlay message="Replay">
      <div className="p-2 md:p-4 max-w-[2000px] mx-auto flex flex-col gap-1 overflow-hidden h-full">
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
                <ReplayPlayer width={resolvedWidth} height={resolvedHeight} />
              )}
            </div>
            <ReplayBreadcrumbs />
          </div>
        )}
      </div>
    </DisabledOverlay>
  );
}
