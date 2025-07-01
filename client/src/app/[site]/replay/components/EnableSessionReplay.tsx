"use client";

import { PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { useGetSessionReplays } from "../../../../api/analytics/sessionReplay/useGetSessionReplays";

export function EnableSessionReplay() {
  const {
    data: replayData,
    isLoading,
    isError,
  } = useGetSessionReplays({ limit: 1, minDuration: 0 });

  // Don't show banner while loading or if there's an error
  if (isLoading || isError) return null;

  const replays = replayData?.pages[0]?.data ?? [];

  // Only show banner if there are no replays tracked
  if (replays.length > 0) return null;

  return (
    <Alert className="p-4 bg-amber-50/50 border-amber-200/50 dark:bg-amber-900/10 dark:border-amber-800/50">
      <div className="flex items-start space-x-3">
        <PlayCircle className="h-5 w-5 mt-0.5 text-amber-500/80" />
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1 text-amber-700/90 dark:text-amber-400/90">
            Enable Session Replay
          </AlertTitle>
          <AlertDescription className="text-sm text-amber-700/80 dark:text-amber-400/80 mb-3">
            Add{" "}
            <code className="bg-amber-100/70 dark:bg-amber-800/50 px-1 py-0.5 rounded text-xs">
              data-session-replay="true"
            </code>{" "}
            to your script tag to record user sessions for debugging and
            analysis.
          </AlertDescription>

          <div className="space-y-2">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 items-start sm:items-center">
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-amber-300/70 text-amber-700/90 hover:bg-amber-100/70 dark:border-amber-600/70 dark:text-amber-400/90 dark:hover:bg-amber-800/50"
              >
                <Link
                  href="https://rybbit.io/docs/script#session-replay"
                  target="_blank"
                >
                  View Documentation <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Alert>
  );
}
