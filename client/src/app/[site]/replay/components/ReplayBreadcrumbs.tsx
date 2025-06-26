import { Duration } from "luxon";
import { useParams } from "next/navigation";
import {
  FileText,
  Camera,
  MousePointer,
  Info,
  Sparkles,
  Puzzle,
  Globe,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useGetSessionReplayEvents } from "../../../../api/analytics/sessionReplay/useGetSessionReplayEvents";
import { useReplayStore } from "./replayStore";
import { cn } from "../../../../lib/utils";
import { ScrollArea } from "../../../../components/ui/scroll-area";

// Event type mapping based on rrweb event types
const EVENT_TYPE_INFO = {
  "0": { name: "DOMContentLoaded", icon: FileText, color: "text-blue-400" },
  "1": { name: "Load", icon: Loader2, color: "text-green-400" },
  "2": { name: "Full Snapshot", icon: Camera, color: "text-purple-400" },
  "3": { name: "Incremental", icon: MousePointer, color: "text-yellow-400" },
  "4": { name: "Meta", icon: Info, color: "text-cyan-400" },
  "5": { name: "Custom", icon: Sparkles, color: "text-pink-400" },
  "6": { name: "Plugin", icon: Puzzle, color: "text-indigo-400" },
};

// Incremental snapshot types (type 3 subtypes)
const INCREMENTAL_TYPES = {
  0: "Mutation",
  1: "Mouse Move",
  2: "Mouse Interaction",
  3: "Scroll",
  4: "Viewport Resize",
  5: "Input",
  6: "Touch Move",
  7: "Media Interaction",
  8: "Style Sheet Rule",
  9: "Canvas Mutation",
  10: "Font",
  11: "Log",
  12: "Drag",
  13: "Style Declaration",
  14: "Selection",
  15: "Adopted Style Sheet",
};

export function ReplayBreadcrumbs() {
  const params = useParams();
  const siteId = Number(params.site);
  const { sessionId, player, setCurrentTime } = useReplayStore();

  const { data, isLoading, error } = useGetSessionReplayEvents(
    siteId,
    sessionId
  );

  const firstTimestamp = data?.events[0]?.timestamp;

  const getTime = (timestamp: number) => {
    return timestamp - (firstTimestamp ?? 0);
  };

  const handleEventClick = (timestamp: number) => {
    if (!player || !firstTimestamp) return;

    const timeInMs = timestamp - firstTimestamp;
    const timeInSeconds = timeInMs / 1000;

    // Seek to the specific time
    player.goto(timeInMs);
    setCurrentTime(timeInSeconds);
  };

  const getEventDescription = (event: any) => {
    const eventTypeStr = String(event.type);
    const eventInfo = EVENT_TYPE_INFO[
      eventTypeStr as keyof typeof EVENT_TYPE_INFO
    ] || {
      name: `Unknown (${eventTypeStr})`,
      icon: Globe,
      color: "text-gray-400",
    };

    // For incremental snapshots, get more detail
    if (eventTypeStr === "3" && event.data?.source !== undefined) {
      const incrementalType =
        INCREMENTAL_TYPES[
          event.data.source as keyof typeof INCREMENTAL_TYPES
        ] || "Unknown";
      return `${incrementalType}`;
    }

    // For meta events, show URL if available
    if (eventTypeStr === "4" && event.data?.href) {
      const url = event.data.href;
      try {
        const urlObj = new URL(url);
        return urlObj.pathname;
      } catch {
        return url;
      }
    }

    return eventInfo.name;
  };

  const getEventIcon = (event: any) => {
    const eventTypeStr = String(event.type);
    const eventInfo =
      EVENT_TYPE_INFO[eventTypeStr as keyof typeof EVENT_TYPE_INFO];

    // Special icons for specific incremental snapshot types
    if (eventTypeStr === "3" && event.data?.source !== undefined) {
      if (event.data.source === 3) return ScrollText; // Scroll
      if (event.data.source === 1 || event.data.source === 2)
        return MousePointer; // Mouse
    }

    return eventInfo?.icon || Globe;
  };

  const getEventColor = (event: any) => {
    const eventTypeStr = String(event.type);
    const eventInfo =
      EVENT_TYPE_INFO[eventTypeStr as keyof typeof EVENT_TYPE_INFO];
    return eventInfo?.color || "text-gray-400";
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-neutral-800 p-4 flex items-center justify-center h-[calc(100vh-120px)]">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (error || !data?.events) {
    return (
      <div className="rounded-lg border border-neutral-800 p-4 text-neutral-400 text-sm">
        No events available
      </div>
    );
  }

  // Filter out repetitive mouse move events for cleaner display
  const filteredEvents = data.events.filter((event, index) => {
    const eventTypeStr = String(event.type);
    // Always show non-incremental events
    if (eventTypeStr !== "3") return true;

    // For incremental events, filter out excessive mouse moves
    if (event.data?.source === 1) {
      // Mouse move
      // Show every 10th mouse move event to reduce clutter
      return index % 10 === 0;
    }

    return true;
  });

  return (
    <div className="rounded-lg border border-neutral-800 flex flex-col">
      <div className="p-2 border-b border-neutral-800 bg-neutral-900 text-xs text-neutral-400">
        {data.events.length} events captured
      </div>
      <ScrollArea className="h-[calc(100vh-160px)]">
        <div className="flex flex-col">
          {filteredEvents.map((event, index) => {
            const Icon = getEventIcon(event);
            const color = getEventColor(event);
            const description = getEventDescription(event);
            const timeMs = getTime(event.timestamp);

            return (
              <div
                key={`${event.timestamp}-${index}`}
                className={cn(
                  "p-3 border-b border-neutral-800 bg-neutral-900",
                  "hover:bg-neutral-800/80 transition-colors cursor-pointer",
                  "flex items-center gap-2 group"
                )}
                onClick={() => handleEventClick(event.timestamp)}
              >
                <div className="text-xs text-neutral-400 w-10">
                  {Duration.fromMillis(timeMs).toFormat("mm:ss")}
                </div>
                <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
                <div className="text-xs text-neutral-200 font-medium truncate">
                  {description}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
