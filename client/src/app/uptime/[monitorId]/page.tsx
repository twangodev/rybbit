"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StandardPage } from "../../../components/StandardPage";
import { Button } from "@/components/ui/button";
import { 
  useMonitor, 
  useMonitorStats, 
  useMonitorEvents,
  useDeleteMonitor 
} from "../../../api/uptime/monitors";
import { StatusOrb } from "../../../components/uptime/StatusOrb";
import { UptimeBar } from "../../../components/uptime/UptimeBar";
import { EditMonitorDialog } from "../../../components/uptime/EditMonitorDialog";
import { 
  ArrowLeft, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  Globe, 
  Network,
  Clock,
  Activity
} from "lucide-react";
import { DateTime } from "luxon";
import { toast } from "sonner";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonitorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const monitorId = parseInt(params.monitorId as string);
  
  const { data: monitor, isLoading: isLoadingMonitor } = useMonitor(monitorId);
  const { data: stats, isLoading: isLoadingStats } = useMonitorStats(monitorId, { interval: "24h" });
  const { data: eventsData, isLoading: isLoadingEvents } = useMonitorEvents(monitorId, { 
    limit: 100,
    startTime: DateTime.now().minus({ days: 7 }).toISODate()
  });
  
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
  
  if (isLoadingMonitor) {
    return (
      <StandardPage>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </StandardPage>
    );
  }
  
  if (!monitor) {
    return (
      <StandardPage>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Monitor not found</h2>
          <Button onClick={() => router.push("/uptime")} variant="outline">
            Back to Monitors
          </Button>
        </div>
      </StandardPage>
    );
  }
  
  const events = eventsData?.events || [];
  
  return (
    <StandardPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/uptime")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{monitor.name}</h1>
                <StatusOrb status={monitor.status?.currentStatus || "unknown"} size="lg" />
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                {monitor.monitorType === "http" 
                  ? monitor.httpConfig?.url 
                  : `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2 text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        {/* 7-Day Uptime Bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7-Day Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <UptimeBar 
              monitorId={monitor.id} 
              events={events}
              className="h-12"
            />
          </CardContent>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Uptime (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatPercentage(stats?.stats.uptimePercentage)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {formatResponseTime(stats?.stats.responseTime.avg)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                {monitor.monitorType === "http" ? (
                  <Globe className="h-4 w-4" />
                ) : (
                  <Network className="h-4 w-4" />
                )}
                Monitor Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold uppercase">
                {monitor.monitorType}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-neutral-500 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Check Interval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">
                {monitor.intervalSeconds < 60 
                  ? `${monitor.intervalSeconds}s`
                  : `${Math.floor(monitor.intervalSeconds / 60)}m`
                }
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Response Time Stats */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Response Time Percentiles (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-sm text-neutral-500">Min</p>
                  <p className="text-lg font-medium">
                    {formatResponseTime(stats.stats.responseTime.min)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">P50</p>
                  <p className="text-lg font-medium">
                    {formatResponseTime(stats.stats.responseTime.p50)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">P95</p>
                  <p className="text-lg font-medium">
                    {formatResponseTime(stats.stats.responseTime.p95)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">P99</p>
                  <p className="text-lg font-medium">
                    {formatResponseTime(stats.stats.responseTime.p99)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Max</p>
                  <p className="text-lg font-medium">
                    {formatResponseTime(stats.stats.responseTime.max)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
                      <StatusOrb 
                        status={event.status === "success" ? "up" : "down"} 
                        size="sm"
                        animated={false}
                      />
                      <div>
                        <p className="text-sm">
                          {event.status === "success" ? "Check passed" : "Check failed"}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {DateTime.fromISO(event.timestamp).toRelative()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono">
                        {formatResponseTime(event.response_time_ms)}
                      </p>
                      {event.status_code && (
                        <p className="text-xs text-neutral-500">
                          {event.status_code}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Edit Dialog */}
        {monitor && (
          <EditMonitorDialog
            monitor={monitor}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
          />
        )}
        
        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the monitor "{monitor.name}" and all its historical data.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Monitor
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StandardPage>
  );
}