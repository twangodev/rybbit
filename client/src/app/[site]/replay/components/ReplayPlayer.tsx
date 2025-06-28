import { Pause, Play } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import rrwebPlayer from "rrweb-player";
import "rrweb-player/dist/style.css";
import { useGetSessionReplayEvents } from "../../../../api/analytics/sessionReplay/useGetSessionReplayEvents";
import { ThreeDotLoader } from "../../../../components/Loaders";
import { ActivitySlider } from "../../../../components/ui/activity-slider";
import { Button } from "../../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { useReplayStore } from "./replayStore";

export function ReplayPlayer({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const params = useParams();
  const siteId = Number(params.site);
  const {
    sessionId,
    player,
    setPlayer,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    playbackSpeed,
    setPlaybackSpeed,
    activityPeriods,
    setActivityPeriods,
    resetPlayerState,
  } = useReplayStore();

  const playerContainerRef = useRef<HTMLDivElement>(null);

  // State for play/pause overlay animation
  const [showPlayPauseOverlay, setShowPlayPauseOverlay] = useState(false);
  const [overlayIcon, setOverlayIcon] = useState<"play" | "pause">("play");
  const overlayTimeoutRef = useRef<number | undefined>(undefined);

  const { data, isLoading, error } = useGetSessionReplayEvents(
    siteId,
    sessionId
  );

  // Reset player state when session changes
  useEffect(() => {
    resetPlayerState();
  }, [sessionId, resetPlayerState]);

  // Cleanup overlay timeout on unmount
  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) {
        clearTimeout(overlayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (data?.events && playerContainerRef.current) {
      // Clear any existing content first
      playerContainerRef.current.innerHTML = "";

      let newPlayer: any = null;

      try {
        // Initialize rrweb player
        newPlayer = new rrwebPlayer({
          target: playerContainerRef.current,
          props: {
            events: data.events as any, // Cast to any to handle type compatibility with rrweb
            width: width,
            // subtract for the custom controls
            height: height - 67,
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

        newPlayer.addEventListener("ui-update-duration", (event: any) => {
          setDuration(event.payload);
        });

        // Get the initial duration from the player
        setTimeout(() => {
          const playerDuration = newPlayer.getMetaData().totalTime;
          if (playerDuration) {
            setDuration(playerDuration);
          }
        }, 100);

        // Calculate activity periods after we have duration
        setTimeout(() => {
          if (!data.events || data.events.length === 0) return;

          const totalDuration = newPlayer.getMetaData().totalTime || 0;

          // Filter for user interaction events (mouse moves, clicks, etc.)
          const interactionEvents = data.events.filter((event) => {
            const eventType = parseInt(event.type.toString());
            // Type 3 = IncrementalSnapshot (includes mouse moves, clicks, etc.)
            return eventType === 3;
          });

          const periods: { start: number; end: number }[] = [];
          const inactivityThreshold = 5000; // 5 seconds of no interaction = inactive
          const firstEventTime = data.events[0].timestamp;

          for (let i = 0; i < interactionEvents.length; i++) {
            const currentEvent = interactionEvents[i];
            const nextEvent = interactionEvents[i + 1];

            const currentTime = currentEvent.timestamp - firstEventTime;
            const nextTime = nextEvent
              ? nextEvent.timestamp - firstEventTime
              : totalDuration;

            if (nextTime - currentTime <= inactivityThreshold) {
              periods.push({
                start: currentTime,
                end: nextTime,
              });
            }
          }

          setActivityPeriods(periods);
        }, 150); // Run after duration is set
      } catch (error) {
        console.error("Failed to initialize rrweb player:", error);
        return;
      }

      return () => {
        // Proper cleanup
        if (newPlayer) {
          newPlayer.pause();
        }
        if (playerContainerRef.current) {
          playerContainerRef.current.innerHTML = "";
        }
        setPlayer(null);
      };
    }
  }, [data]);

  const handlePlayPause = () => {
    if (!player) return;

    const newPlayingState = !isPlaying;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlaying(newPlayingState);

    // Show overlay animation
    setOverlayIcon(newPlayingState ? "pause" : "play");
    setShowPlayPauseOverlay(true);

    // Clear existing timeout
    if (overlayTimeoutRef.current) {
      clearTimeout(overlayTimeoutRef.current);
    }

    // Hide overlay after animation
    overlayTimeoutRef.current = window.setTimeout(() => {
      setShowPlayPauseOverlay(false);
    }, 800);
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

  const handleSliderChange = (value: number[]) => {
    if (!player || !duration) return;

    // Pause the player when user scrubs manually
    player.pause();
    setIsPlaying(false);

    const newTime = (value[0] / 100) * duration;
    player.goto(newTime);
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: string) => {
    if (!player) return;
    setPlaybackSpeed(speed);
    player.setSpeed(parseFloat(speed));
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

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle hotkeys when the player exists and focus is not on an input/textarea
      if (
        !player ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handleSkipBack();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleSkipForward();
          break;
        case " ":
          event.preventDefault();
          handlePlayPause();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [player, handleSkipBack, handleSkipForward, handlePlayPause]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <div className="text-red-500 mb-4">
          Error loading replay: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="bg-black h-full flex items-center justify-center">
        <ThreeDotLoader className="w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-neutral-950">
      {/* Player Container */}
      <div className="flex-1 flex items-center justify-center overflow-hidden relative">
        <div
          ref={playerContainerRef}
          className="w-full bg-black rounded-lg shadow-2xl [&_.rr-player]:!bg-black cursor-pointer"
          style={{
            position: "relative",
          }}
          onClick={handlePlayPause}
        />

        {/* Play/Pause Overlay Animation */}
        {showPlayPauseOverlay && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 rounded-full p-6 animate-in fade-in zoom-in-50 duration-200">
              {overlayIcon === "play" ? (
                <Play className="w-12 h-12 text-white" fill="currentColor" />
              ) : (
                <Pause className="w-12 h-12 text-white" fill="currentColor" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom Controls */}
      <div className="border border-neutral-800 p-2 pb-3 bg-neutral-900 rounded-b-lg pt-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="smIcon"
            onClick={handlePlayPause}
            disabled={!player}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" fill="currentColor" />
            ) : (
              <Play className="w-4 h-4" fill="currentColor" />
            )}
          </Button>
          <div className="flex-1 mx-2 -mt-8">
            <ActivitySlider
              value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSliderChange}
              max={100}
              step={0.1}
              activityPeriods={activityPeriods}
              duration={duration}
              events={data?.events || []}
              className="w-full"
            />
          </div>
          <div className="text-xs text-neutral-300 w-20 text-center">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          <Select value={playbackSpeed} onValueChange={handleSpeedChange}>
            <SelectTrigger size="sm" className="w-14 mx-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent size="sm">
              <SelectItem value="0.25" size="sm">
                0.25x
              </SelectItem>
              <SelectItem value="0.5" size="sm">
                0.5x
              </SelectItem>
              <SelectItem value="1" size="sm">
                1x
              </SelectItem>
              <SelectItem value="2" size="sm">
                2x
              </SelectItem>
              <SelectItem value="4" size="sm">
                4x
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
