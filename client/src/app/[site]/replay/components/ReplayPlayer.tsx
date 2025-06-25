import { useEffect, useRef, useState } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize,
  Download,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { DateTime } from "luxon";
import { useGetSessionReplayEvents } from "../../../../api/analytics/sessionReplay/useGetSessionReplayEvents";

interface ReplayPlayerProps {
  siteId: number;
  sessionId: string;
}

export default function ReplayPlayer({ siteId, sessionId }: ReplayPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useGetSessionReplayEvents(
    siteId,
    sessionId
  );

  console.log("Replay data:", data);
  console.log("Events:", data?.events);
  console.log(
    "Event types:",
    data?.events?.map((e) => ({ type: e.type, timestamp: e.timestamp }))
  );

  useEffect(() => {
    if (data?.events && playerContainerRef.current) {
      // Initialize rrweb player
      const newPlayer = new rrwebPlayer({
        target: playerContainerRef.current,
        props: {
          events: data.events as any, // Cast to any to handle type compatibility with rrweb
          width: 1024,
          height: 576,
          autoPlay: false,
          showController: false, // We'll use custom controls
        },
      });

      setPlayer(newPlayer);

      // Set up event listeners
      newPlayer.addEventListener("ui-update-current-time", (event: any) => {
        setCurrentTime(event.payload);
      });

      newPlayer.addEventListener("ui-update-player-state", (event: any) => {
        setIsPlaying(event.payload === "playing");
      });

      // Calculate duration
      if (data.events.length > 0) {
        const firstEvent = data.events[0];
        const lastEvent = data.events[data.events.length - 1];
        setDuration(lastEvent.timestamp - firstEvent.timestamp);
      }

      return () => {
        // Cleanup
        newPlayer.pause();
      };
    }
  }, [data]);

  const handlePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkipBack = () => {
    if (!player) return;
    const newTime = Math.max(0, currentTime - 10000); // Skip back 10 seconds
    player.goto(newTime);
  };

  const handleSkipForward = () => {
    if (!player) return;
    const newTime = Math.min(duration, currentTime + 10000); // Skip forward 10 seconds
    player.goto(newTime);
  };

  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        playerContainerRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-500 mb-4">
          Error loading replay: {(error as Error).message}
        </div>
        <Link href={`/${siteId}/replay`}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Replays
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-neutral-800 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="w-full h-full" />
        </div>
        <div className="border-t border-neutral-800 p-4">
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const metadata = data?.metadata;
  const startTime = metadata
    ? DateTime.fromSQL(metadata.startTime.toString(), {
        zone: "utc",
      }).toLocal()
    : DateTime.now();

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${siteId}/replay`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-white">
                Session Replay
              </h1>
              <div className="text-sm text-neutral-400">
                {startTime.toLocaleString(DateTime.DATETIME_MED)} •{" "}
                {metadata?.pageUrl}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Maximize className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Player Container */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={playerContainerRef}
          className="w-full h-full max-w-6xl bg-black rounded-lg shadow-2xl"
          style={{ position: "relative" }}
        />
      </div>

      {/* Custom Controls */}
      <div className="border-t border-neutral-800 p-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipBack}
            disabled={!player}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={handlePlayPause}
            disabled={!player}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleSkipForward}
            disabled={!player}
          >
            <SkipForward className="w-4 h-4" />
          </Button>

          <div className="flex-1 mx-4">
            <div className="bg-neutral-800 rounded-full h-2 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-green-500 transition-all"
                style={{
                  width: `${(currentTime / duration) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="text-sm text-neutral-400 min-w-[100px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="mt-4 pt-4 border-t border-neutral-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-neutral-500">User ID</div>
              <div className="text-neutral-200">{metadata.userId}</div>
            </div>
            <div>
              <div className="text-neutral-500">Browser</div>
              <div className="text-neutral-200">
                {metadata.browser} {metadata.browserVersion}
              </div>
            </div>
            <div>
              <div className="text-neutral-500">Device</div>
              <div className="text-neutral-200">{metadata.deviceType}</div>
            </div>
            <div>
              <div className="text-neutral-500">Location</div>
              <div className="text-neutral-200">
                {metadata.city}, {metadata.country}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
