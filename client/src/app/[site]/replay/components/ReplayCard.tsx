import { Play, Monitor, Globe, Clock } from "lucide-react";
import { DateTime } from "luxon";
import Link from "next/link";
import { CountryFlag } from "../../components/shared/icons/CountryFlag";
import { Browser } from "../../components/shared/icons/Browser";
import { Skeleton } from "../../../../components/ui/skeleton";

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

export function ReplayCard({
  replay,
  siteId,
}: {
  replay: SessionReplayListItem;
  siteId: number;
}) {
  const startTime = DateTime.fromISO(replay.startTime);
  const duration = replay.durationMs
    ? Math.ceil(replay.durationMs / 1000)
    : null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return <Globe className="w-4 h-4" />;
      case "tablet":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
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
    <Link href={`/${siteId}/replay/${replay.sessionId}`}>
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <Play className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <div className="font-medium text-white">
                {startTime.toLocaleString(DateTime.TIME_SIMPLE)}
              </div>
              <div className="text-sm text-neutral-400">
                {startTime.toLocaleString(DateTime.DATE_MED)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {duration && (
              <div className="flex items-center gap-1 text-neutral-400">
                <Clock className="w-3 h-3" />
                {formatDuration(duration)}
              </div>
            )}
            <div className={`text-xs ${getStatusColor(replay.recordingStatus)}`}>
              {replay.recordingStatus}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-sm text-neutral-200 truncate">
            {replay.pageUrl}
          </div>
          <div className="text-xs text-neutral-500">
            User ID: {replay.userId}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <div className="flex items-center gap-1">
            <CountryFlag country={replay.country} />
            <span>{replay.country}</span>
          </div>
          <div className="flex items-center gap-1">
            <Browser browser={replay.browser} />
            <span>{replay.browser}</span>
          </div>
          <div className="flex items-center gap-1">
            {getDeviceIcon(replay.deviceType)}
            <span>{replay.deviceType}</span>
          </div>
          <div className="ml-auto text-xs">
            {replay.eventCount} events
          </div>
        </div>
      </div>
    </Link>
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