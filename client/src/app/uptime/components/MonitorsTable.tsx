import React from "react";
import { DateTime } from "luxon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusOrb } from "./StatusOrb";
import { UptimeBar } from "./UptimeBar";
import { UptimeMonitor, MonitorEvent } from "@/api/uptime/monitors";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";

interface MonitorsTableProps {
  monitors: UptimeMonitor[];
  monitorEvents: Record<number, MonitorEvent[]>;
  isLoading?: boolean;
  onMonitorClick?: (monitor: UptimeMonitor) => void;
}

const formatResponseTime = (value?: number) => {
  if (value === undefined || value === null) return "-";
  return `${Math.round(value)}ms`;
};

const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return "-";
  return `${value.toFixed(1)}%`;
};

const formatLastPing = (lastCheckedAt?: string) => {
  if (!lastCheckedAt) return "-";

  // PostgreSQL timestamps are in SQL format, treated as local time
  const lastPing = DateTime.fromSQL(lastCheckedAt, {
    zone: "utc",
  }).toLocal();

  if (!lastPing.isValid) return "-";

  const now = DateTime.now();
  const diffMs = now.toMillis() - lastPing.toMillis();

  // If timestamp is in the future, show "just now"
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;

  return "just now";
};

const calculateTotalUptime = (monitor: UptimeMonitor, events: MonitorEvent[]) => {
  // Get monitor creation time
  const createdAt = DateTime.fromSQL(monitor.createdAt, { zone: "utc" });
  const now = DateTime.now();

  // Find the most recent downtime event
  const lastDownEvent = events
    .filter((e) => e.status === "failure" || e.status === "timeout")
    .sort((a, b) => {
      const timeA = DateTime.fromSQL(a.timestamp, { zone: "utc" }).toMillis();
      const timeB = DateTime.fromSQL(b.timestamp, { zone: "utc" }).toMillis();
      return timeB - timeA; // Sort descending
    })[0];

  // Calculate uptime from last down event or creation
  let uptimeStart = createdAt;
  if (lastDownEvent) {
    const lastDownTime = DateTime.fromSQL(lastDownEvent.timestamp, { zone: "utc" });
    if (lastDownTime > createdAt) {
      uptimeStart = lastDownTime;
    }
  }

  const uptimeMs = now.toMillis() - uptimeStart.toMillis();
  const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export function MonitorsTable({ monitors, monitorEvents, isLoading, onMonitorClick }: MonitorsTableProps) {
  console.info(monitors);
  console.info(monitorEvents);

  return (
    <div className="rounded-md border border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Radio className="ml-2 w-4 h-4" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead className="w-48">Last 7 Days</TableHead>
            <TableHead className="w-28">Last Ping</TableHead>
            <TableHead className="w-20 text-right whitespace-nowrap">Uptime %</TableHead>
            <TableHead className="w-32 text-right">Total Uptime</TableHead>
            <TableHead className="w-20 text-right">P90</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-full mx-auto" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 ml-auto" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableCell>
              </TableRow>
            ))
          ) : monitors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-neutral-500">
                No monitors configured
              </TableCell>
            </TableRow>
          ) : (
            monitors.map((monitor) => {
              const events = monitorEvents[monitor.id] || [];
              const stats = monitor.status;
              const totalUptime = calculateTotalUptime(monitor, events);

              // Calculate percentiles from events if not available in status
              let p90 = "-";
              if (events.length > 0) {
                const responseTimes = events
                  .filter((e) => e.status === "success" && e.response_time_ms)
                  .map((e) => e.response_time_ms)
                  .sort((a, b) => a - b);

                if (responseTimes.length > 0) {
                  const getPercentile = (arr: number[], p: number) => {
                    const index = Math.ceil((p / 100) * arr.length) - 1;
                    return arr[index];
                  };

                  p90 = formatResponseTime(getPercentile(responseTimes, 90));
                }
              }

              return (
                <TableRow
                  key={monitor.id}
                  className="cursor-pointer hover:bg-neutral-900/50"
                  onClick={() => onMonitorClick?.(monitor)}
                >
                  <TableCell className="text-center">
                    <StatusOrb status={stats?.currentStatus || "unknown"} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{monitor.name}</div>
                    <div className="text-xs text-neutral-500">
                      {monitor.monitorType === "http"
                        ? monitor.httpConfig?.url
                        : `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 text-xs font-medium rounded-full",
                        monitor.monitorType === "http"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      )}
                    >
                      {monitor.monitorType.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <UptimeBar monitorId={monitor.id} events={events} />
                  </TableCell>
                  <TableCell>{formatLastPing(stats?.lastCheckedAt)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(stats?.uptimePercentage7d)}</TableCell>
                  <TableCell className="text-right">{totalUptime}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{p90}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
