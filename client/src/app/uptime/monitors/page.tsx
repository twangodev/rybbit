"use client";

import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAllMonitorEvents, useMonitors } from "../../../api/uptime/monitors";
import { MonitorDialog } from "../components/MonitorDialog";
import { MonitorsTable } from "../components/MonitorsTable";
import { Scaffolding } from "../components/Scaffolding";

export default function UptimePage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: monitors = [], isLoading: isLoadingMonitors } = useMonitors();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch events for all monitors using React Query
  const { data: monitorEvents = {}, isLoading: isLoadingEvents } = useAllMonitorEvents(monitors);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
    queryClient.invalidateQueries({ queryKey: ["uptime-all-monitor-events"] });
  };

  const handleMonitorClick = (monitor: any) => {
    router.push(`/uptime/monitors/${monitor.id}`);
  };

  return (
    <Scaffolding>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Uptime Monitoring</h1>
          <p className="text-sm text-neutral-500 mt-1">Monitor the availability and performance of your endpoints</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" className="flex items-center gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Add Monitor
          </Button>
        </div>
      </div>

      <MonitorsTable
        monitors={monitors}
        monitorEvents={monitorEvents}
        isLoading={isLoadingMonitors || isLoadingEvents}
        onMonitorClick={handleMonitorClick}
      />

      <MonitorDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </Scaffolding>
  );
}
