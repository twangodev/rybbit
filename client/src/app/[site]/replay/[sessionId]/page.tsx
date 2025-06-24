"use client";

import { useParams } from "next/navigation";
import { useSetPageTitle } from "../../../../../hooks/useSetPageTitle";
import ReplayPlayer from "../components/ReplayPlayer";

export default function SessionReplayPlayerPage() {
  const params = useParams();
  const siteId = Number(params.site);
  const sessionId = params.sessionId as string;

  useSetPageTitle("Rybbit · Session Replay Player");

  return (
    <div className="h-full flex flex-col">
      <ReplayPlayer siteId={siteId} sessionId={sessionId} />
    </div>
  );
}