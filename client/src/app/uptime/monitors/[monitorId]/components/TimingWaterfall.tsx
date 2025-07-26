"use client";

import { cn } from "@/lib/utils";
import { MonitorEvent } from "@/api/uptime/monitors";

interface TimingWaterfallProps {
  event: MonitorEvent;
}

export function TimingWaterfall({ event }: TimingWaterfallProps) {
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
    return null;
  }

  return (
    <div className="w-full">
      <div className="text-sm font-medium mb-2">Timings</div>
      <div className="relative h-6 bg-neutral-800 rounded overflow-hidden">
        {(() => {
          let left = 0;
          return timings.map((timing, index) => {
            // Use normalized width if sum exceeds total, otherwise use actual proportion
            const width = needsNormalization 
              ? (timing.time! / sumOfTimings) * 100
              : (timing.time! / totalTime) * 100;
            
            // Ensure we don't exceed 100%
            const adjustedWidth = Math.min(width, 100 - left);
            
            const element = (
              <div
                key={timing.label}
                className={cn("absolute h-full", timing.color)}
                style={{
                  left: `${left}%`,
                  width: `${adjustedWidth}%`,
                  zIndex: timings.length - index, // Ensure proper layering
                }}
                title={`${timing.label}: ${timing.time}ms`}
              />
            );
            left += adjustedWidth;
            return element;
          });
        })()}
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {timings.map((timing) => (
          <div key={timing.label} className="flex items-center gap-1 text-xs">
            <div className={cn("w-3 h-3 rounded", timing.color)} />
            <span className="text-neutral-400">{timing.label}:</span>
            <span className="font-mono">{timing.time}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
}