"use client";

import { cn } from "@/lib/utils";
import { MonitorEvent } from "@/api/uptime/monitors";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InlineTimingWaterfallProps {
  event: MonitorEvent;
}

export function InlineTimingWaterfall({ event }: InlineTimingWaterfallProps) {
  const timings = [
    { label: "DNS", time: event.dns_time_ms, color: "bg-purple-500" },
    { label: "TCP", time: event.tcp_time_ms, color: "bg-blue-500" },
    { label: "TLS", time: event.tls_time_ms, color: "bg-cyan-500" },
    { label: "TTFB", time: event.ttfb_ms, color: "bg-green-500" },
    { label: "Transfer", time: event.transfer_time_ms, color: "bg-yellow-500" },
  ].filter((t) => t.time && t.time > 0);

  const totalTime = event.response_time_ms || 0;

  // Calculate the sum of all timing components
  const sumOfTimings = timings.reduce((sum, t) => sum + (t.time || 0), 0);

  // If sum exceeds total, we need to normalize
  const needsNormalization = sumOfTimings > totalTime;

  if (timings.length === 0 || totalTime === 0) {
    return <div className="w-24 h-3" />;
  }

  return (
    <TooltipProvider>
      <div className="relative h-3 w-40 bg-neutral-800 rounded overflow-hidden">
        {(() => {
          let left = 0;
          return timings.map((timing, index) => {
            // Use normalized width if sum exceeds total, otherwise use actual proportion
            const width = needsNormalization ? (timing.time! / sumOfTimings) * 100 : (timing.time! / totalTime) * 100;

            // Ensure we don't exceed 100%
            const adjustedWidth = Math.min(width, 100 - left);

            const element = (
              <Tooltip key={timing.label}>
                <TooltipTrigger asChild>
                  <div
                    className={cn("absolute h-full", timing.color)}
                    style={{
                      left: `${left}%`,
                      width: `${adjustedWidth}%`,
                      zIndex: timings.length - index,
                    }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="font-medium">{timing.label}</div>
                  <div className="font-mono">{timing.time}ms</div>
                </TooltipContent>
              </Tooltip>
            );
            left += adjustedWidth;
            return element;
          });
        })()}
      </div>
    </TooltipProvider>
  );
}
