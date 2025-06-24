"use client";

import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { SESSION_REPLAY_PAGE_FILTERS } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import ReplayList from "./components/ReplayList";

export default function SessionReplayPage() {
  useSetPageTitle("Rybbit · Session Replay");

  return (
    <div className="p-2 md:p-4 max-w-[1300px] mx-auto space-y-3">
      <SubHeader availableFilters={SESSION_REPLAY_PAGE_FILTERS} />
      <ReplayList />
    </div>
  );
}