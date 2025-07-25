"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, Edit2, RefreshCw, Trash2 } from "lucide-react";
import { DateTime } from "luxon";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  UptimeMonitor,
  useDeleteMonitor,
  useMonitor,
  useMonitorEvents,
  useMonitorStats,
  useMonitorUptime,
} from "../../../../api/uptime/monitors";
import { MonitorDialog } from "../../components/dialog";
import { MonitorResponseTimeChart } from "../../components/MonitorResponseTimeChart";
import { Scaffolding } from "../../components/Scaffolding";
import { StatusOrb } from "../../components/StatusOrb";
import { TIME_RANGES, useUptimeStore } from "../../components/uptimeStore";
import { getHoursFromTimeRange } from "../../components/utils";

interface StatCardProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-850">
      <div className="p-3 pb-0 text-sm text-neutral-500 flex items-center gap-2 font-normal">{label}</div>
      <div className="p-3 py-2">
        {isLoading ? <Skeleton className="h-7 w-24" /> : <p className="text-xl font-semibold">{value}</p>}
      </div>
    </div>
  );
}

const getMonitorName = (monitor: UptimeMonitor) => {
  return (
    monitor.name ||
    (monitor.monitorType === "http" ? monitor.httpConfig?.url : `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`)
  );
};

const MonitorHeader = ({ monitor, isLoadingMonitor }: { monitor?: UptimeMonitor; isLoadingMonitor: boolean }) => {
  if (isLoadingMonitor) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-64" /> {/* Monitor name */}
          <Skeleton className="h-4 w-4 rounded-full" /> {/* Status orb */}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-4 w-4" /> {/* Status text */}
          <span className="text-neutral-500">•</span>
          <Skeleton className="h-4 w-48" /> {/* URL/host */}
        </div>
      </div>
    );
  }
  if (!monitor) return null;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{getMonitorName(monitor)}</h1>
        <StatusOrb status={monitor.status?.currentStatus || "unknown"} size="lg" />
      </div>
      <p className="text-sm text-neutral-300 mt-1 flex items-center gap-2">
        <span
          className={cn("font-medium", monitor.status?.currentStatus === "up" ? "text-green-400" : "text-red-500/80")}
        >
          {monitor.status?.currentStatus === "up" ? "Up" : "Down"}
        </span>
        •
        <span>
          {monitor.monitorType === "http"
            ? monitor.httpConfig?.url
            : `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`}
        </span>
      </p>
    </div>
  );
};

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = parseInt(params.monitorId as string);

  const { timeRange, setTimeRange } = useUptimeStore();
  const { data: monitor, isLoading: isLoadingMonitor } = useMonitor(monitorId);
  const { data: stats, isLoading: isLoadingStats } = useMonitorStats(monitorId, {
    hours: getHoursFromTimeRange(timeRange),
  });
  const { data: eventsData, isLoading: isLoadingEvents } = useMonitorEvents(monitorId, {
    limit: 100,
  });
  const { data: uptimeData, isLoading: isLoadingUptime } = useMonitorUptime(monitorId);

  const deleteMonitor = useDeleteMonitor();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteMonitor.mutateAsync(monitorId);
      toast.success("Monitor deleted successfully");
      router.push("/uptime");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete monitor");
    }
  };

  const formatResponseTime = (value?: number) => {
    if (!value) return "-";
    return `${Math.round(value)}ms`;
  };

  const formatPercentage = (value?: number) => {
    if (!value) return "-";
    return `${value.toFixed(1)}%`;
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "-";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (!monitor && !isLoadingMonitor) {
    return (
      <Scaffolding>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Monitor not found</h2>
          <Button onClick={() => router.push("/uptime")} variant="outline">
            Back to Monitors
          </Button>
        </div>
      </Scaffolding>
    );
  }

  const events = eventsData?.events || [];

  return (
    <Scaffolding>
      {/* Header */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/uptime/monitors")}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <div className="flex items-start justify-between">
        <MonitorHeader monitor={monitor} isLoadingMonitor={isLoadingMonitor} />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowEditDialog(true)} className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {TIME_RANGES.map((range) => (
          <Button
            key={range.value}
            variant={timeRange === range.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeRange(range.value)}
            className="h-7 px-2 text-xs"
          >
            {range.label}
          </Button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Uptime" value={formatPercentage(stats?.stats.uptimePercentage)} isLoading={isLoadingStats} />
        <StatCard
          label="Current Uptime"
          value={formatUptime(uptimeData?.currentUptimeSeconds)}
          isLoading={isLoadingUptime}
        />
        <StatCard label="P50" value={formatResponseTime(stats?.stats.responseTime.p50)} isLoading={isLoadingStats} />
        <StatCard label="P90" value={formatResponseTime(stats?.stats.responseTime.p90)} isLoading={isLoadingStats} />
        <StatCard label="P95" value={formatResponseTime(stats?.stats.responseTime.p95)} isLoading={isLoadingStats} />
        <StatCard label="P99" value={formatResponseTime(stats?.stats.responseTime.p99)} isLoading={isLoadingStats} />
      </div>

      {/* Response Time Chart */}
      <MonitorResponseTimeChart monitor={monitor} isLoading={isLoadingMonitor} />

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEvents ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <p className="text-sm text-neutral-500">No events recorded yet</p>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 10).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StatusOrb status={event.status === "success" ? "up" : "down"} size="sm" animated={false} />
                    <div>
                      <p className="text-sm">{event.status === "success" ? "Check passed" : "Check failed"}</p>
                      <p className="text-xs text-neutral-500">
                        {DateTime.fromSQL(event.timestamp, { zone: "utc" }).toRelative()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono">{formatResponseTime(event.response_time_ms)}</p>
                    {event.status_code && <p className="text-xs text-neutral-500">{event.status_code}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {monitor && <MonitorDialog monitor={monitor} open={showEditDialog} onOpenChange={setShowEditDialog} />}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the monitor "
              {monitor?.name ||
                (monitor?.monitorType === "http"
                  ? monitor?.httpConfig?.url
                  : `${monitor?.tcpConfig?.host}:${monitor?.tcpConfig?.port}`)}
              " and all its historical data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Monitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Scaffolding>
  );
}
