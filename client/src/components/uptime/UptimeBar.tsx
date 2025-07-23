import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DateTime } from "luxon";

interface UptimeBarProps {
  monitorId: number;
  events: Array<{
    timestamp: string;
    status: "success" | "failure" | "timeout";
  }>;
  className?: string;
}

export function UptimeBar({ monitorId, events, className }: UptimeBarProps) {
  // Group events by day for the last 7 days
  const now = DateTime.now();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = now.minus({ days: 6 - i });
    return {
      date: date.toISODate(),
      dateFormatted: date.toFormat("MMM dd"),
      dayOfWeek: date.toFormat("ccc"),
      events: [] as typeof events,
      successCount: 0,
      failureCount: 0,
      timeoutCount: 0,
    };
  });

  // Group events by day
  events.forEach(event => {
    const eventDate = DateTime.fromISO(event.timestamp).toISODate();
    const dayData = days.find(d => d.date === eventDate);
    if (dayData) {
      dayData.events.push(event);
      if (event.status === "success") dayData.successCount++;
      else if (event.status === "failure") dayData.failureCount++;
      else if (event.status === "timeout") dayData.timeoutCount++;
    }
  });

  return (
    <TooltipProvider>
      <div className={cn("flex gap-0.5 h-8", className)}>
        {days.map((day, index) => {
          const totalEvents = day.events.length;
          const hasIssues = day.failureCount > 0 || day.timeoutCount > 0;
          const uptimePercentage = totalEvents > 0 
            ? (day.successCount / totalEvents * 100).toFixed(1)
            : "100.0";

          let barColor = "bg-green-500";
          if (totalEvents === 0) {
            barColor = "bg-gray-300 dark:bg-gray-600";
          } else if (day.failureCount > 0 || day.timeoutCount > 0) {
            const issuePercentage = (day.failureCount + day.timeoutCount) / totalEvents;
            if (issuePercentage >= 0.5) barColor = "bg-red-500";
            else if (issuePercentage >= 0.1) barColor = "bg-orange-500";
            else barColor = "bg-yellow-500";
          }

          return (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex-1 rounded-sm cursor-pointer transition-opacity hover:opacity-80",
                    barColor
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div className="font-medium">{day.dayOfWeek}, {day.dateFormatted}</div>
                  {totalEvents > 0 ? (
                    <>
                      <div className="text-xs text-gray-300 mt-1">
                        Uptime: {uptimePercentage}%
                      </div>
                      <div className="text-xs text-gray-300">
                        Checks: {totalEvents}
                      </div>
                      {day.successCount > 0 && (
                        <div className="text-xs text-green-400">
                          Success: {day.successCount}
                        </div>
                      )}
                      {day.failureCount > 0 && (
                        <div className="text-xs text-red-400">
                          Failures: {day.failureCount}
                        </div>
                      )}
                      {day.timeoutCount > 0 && (
                        <div className="text-xs text-orange-400">
                          Timeouts: {day.timeoutCount}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-gray-300 mt-1">
                      No data
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}