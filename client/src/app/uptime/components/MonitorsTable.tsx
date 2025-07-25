import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UptimeMonitor, MonitorEvent } from "@/api/uptime/monitors";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio } from "lucide-react";
import { MonitorTableRow } from "./MonitorTableRow";

interface MonitorsTableProps {
  monitors: UptimeMonitor[];
  monitorEvents: Record<number, MonitorEvent[]>;
  isLoading?: boolean;
  onMonitorClick?: (monitor: UptimeMonitor) => void;
}


export function MonitorsTable({ monitors, monitorEvents, isLoading, onMonitorClick }: MonitorsTableProps) {
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
              return (
                <MonitorTableRow
                  key={monitor.id}
                  monitor={monitor}
                  events={events}
                  onClick={() => onMonitorClick?.(monitor)}
                />
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
