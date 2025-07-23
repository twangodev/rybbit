import React from "react";
import { DateTime } from "luxon";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusOrb } from "./StatusOrb";
import { UptimeBar } from "./UptimeBar";
import { UptimeMonitor, MonitorEvent } from "@/api/uptime/monitors";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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

export function MonitorsTable({ monitors, monitorEvents, isLoading, onMonitorClick }: MonitorsTableProps) {
  console.info(monitors);
  console.info(monitorEvents);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Status</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="w-24">Type</TableHead>
            <TableHead className="w-48">Last 7 Days</TableHead>
            <TableHead className="w-28">Last Ping</TableHead>
            <TableHead className="w-20 text-right whitespace-nowrap">Uptime %</TableHead>
            <TableHead className="w-20 text-right">P50</TableHead>
            <TableHead className="w-20 text-right">P75</TableHead>
            <TableHead className="w-20 text-right">P90</TableHead>
            <TableHead className="w-20 text-right">P99</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-neutral-500">
                No monitors configured
              </TableCell>
            </TableRow>
          ) : (
            monitors.map((monitor) => {
              const events = monitorEvents[monitor.id] || [];
              const stats = monitor.status;

              // Calculate percentiles from events if not available in status
              let p50 = "-",
                p75 = "-",
                p90 = "-",
                p99 = "-";
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

                  p50 = formatResponseTime(getPercentile(responseTimes, 50));
                  p75 = formatResponseTime(getPercentile(responseTimes, 75));
                  p90 = formatResponseTime(getPercentile(responseTimes, 90));
                  p99 = formatResponseTime(getPercentile(responseTimes, 99));
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
                  <TableCell className="text-right font-mono text-sm">{p50}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{p75}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{p90}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{p99}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
