"use client";

import { useMeasure } from "@uidotdev/usehooks";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SESSION_REPLAY_PAGE_FILTERS } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { ReplayList } from "./components/ReplayList";
import { ReplayPlayer } from "./components/ReplayPlayer";

export default function SessionReplayPage() {
  useSetPageTitle("Rybbit · Session Replay");

  const [ref, { height: resolvedHeight, width: resolvedWidth }] = useMeasure();

  return (
    <div className="p-2 md:p-4 max-w-[2000px] mx-auto space-y-3  h-screen">
      <SubHeader availableFilters={SESSION_REPLAY_PAGE_FILTERS} />
      <div className="grid grid-cols-[auto_1fr] gap-3">
        <div className="h-[calc(100vh-120px)] overflow-y-auto w-[300px]">
          <ReplayList />
        </div>
        <div ref={ref} className="w-[calc(100vw-570px)]">
          {resolvedWidth && <ReplayPlayer width={resolvedWidth} />}
        </div>
      </div>
    </div>
  );
}
