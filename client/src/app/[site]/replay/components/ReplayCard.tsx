import { Clock, MousePointerClick } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import {
  BrowserTooltipIcon,
  CountryFlagTooltipIcon,
  DeviceTypeTooltipIcon,
  OperatingSystemTooltipIcon,
} from "../../../../components/TooltipIcons/TooltipIcons";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
import { formatter } from "../../../../lib/utils";
import { replayStore } from "./store";

interface SessionReplayListItem {
  session_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  page_url: string;
  event_count: number;
  recording_status: string;
  country: string;
  region: string;
  city: string;
  browser: string;
  browser_version: string;
  operating_system: string;
  operating_system_version: string;
  device_type: string;
  screen_width: number;
  screen_height: number;
}

export function ReplayCard({
  replay,
  siteId,
}: {
  replay: SessionReplayListItem;
  siteId: number;
}) {
  const { setSessionId } = replayStore();
  const startTime = DateTime.fromSQL(replay.start_time, {
    zone: "utc",
  }).toLocal();
  const duration = replay.duration_ms
    ? Math.ceil(replay.duration_ms / 1000)
    : null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "recording":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-neutral-400";
    }
  };

  return (
    <div
      className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:bg-neutral-800/50 transition-colors cursor-pointer"
      onClick={() => {
        setSessionId(replay.session_id);
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-xs text-neutral-500">
          {replay.user_id.slice(0, 10)}...
        </div>
        <div className="text-xs  text-neutral-400">
          {startTime.toRelative()}
        </div>
        {duration && (
          <div className="flex items-center gap-1 text-neutral-400 text-xs">
            <Clock className="w-3 h-3" />
            {formatDuration(duration)}
          </div>
        )}
        <div className={`text-xs ${getStatusColor(replay.recording_status)}`}>
          {replay.recording_status}
        </div>
      </div>

      <div className="text-xs text-neutral-200 truncate mb-2">
        {replay.page_url}
      </div>

      <div className="flex items-center gap-2 text-sm text-neutral-400">
        <CountryFlagTooltipIcon
          country={replay.country}
          city={replay.city}
          region={replay.region}
        />
        <BrowserTooltipIcon
          browser={replay.browser}
          browser_version={replay.browser_version}
        />
        <OperatingSystemTooltipIcon
          operating_system={replay.operating_system}
          operating_system_version={replay.operating_system_version}
        />
        <DeviceTypeTooltipIcon
          device_type={replay.device_type}
          screen_width={replay.screen_width}
          screen_height={replay.screen_height}
        />

        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-neutral-800 text-gray-300"
        >
          <MousePointerClick className="w-4 h-4 text-amber-500" />
          <span>{formatter(replay.event_count)}</span>
        </Badge>
      </div>
    </div>
  );
}

export function ReplayCardSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      <div className="mb-3">
        <Skeleton className="h-4 w-64 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>

      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-20 ml-auto" />
      </div>
    </div>
  );
}
