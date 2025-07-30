"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DateTime } from "luxon";
import { AlertCircle, CheckCircle, MoreVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  UptimeIncident,
  useAcknowledgeIncident,
  useIncidents,
  useResolveIncident,
} from "../../../api/uptime/incidents";
import { StandardPage } from "../../../components/StandardPage";

export default function IncidentsPage() {
  const [statusFilter, setStatusFilter] = useState<"active" | "acknowledged" | "resolved" | "all">("active");

  const { data, isLoading } = useIncidents({ status: statusFilter });
  const acknowledgeIncident = useAcknowledgeIncident();
  const resolveIncident = useResolveIncident();

  const handleAcknowledge = async (incident: UptimeIncident) => {
    try {
      await acknowledgeIncident.mutateAsync(incident.id);
      toast.success("Incident acknowledged");
    } catch (error) {
      toast.error("Failed to acknowledge incident");
    }
  };

  const handleResolve = async (incident: UptimeIncident) => {
    try {
      await resolveIncident.mutateAsync(incident.id);
      toast.success("Incident resolved");
    } catch (error) {
      toast.error("Failed to resolve incident");
    }
  };

  const getStatusIcon = (status: UptimeIncident["status"]) => {
    switch (status) {
      case "active":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "acknowledged":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const formatStartTime = (timestamp: string) => {
    const dt = DateTime.fromISO(timestamp);
    return dt.toRelative() || dt.toFormat("MMM dd, HH:mm");
  };

  return (
    <StandardPage showSidebar={false}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Incidents</h1>

        <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border border-neutral-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Monitor Name</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell>
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.incidents?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-neutral-500">
                  No incidents found
                </TableCell>
              </TableRow>
            ) : (
              data?.incidents?.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>{getStatusIcon(incident.status)}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{incident.monitorName}</div>
                      {incident.region && <div className="text-xs text-neutral-500 uppercase">{incident.region}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{formatStartTime(incident.startTime)}</TableCell>
                  <TableCell>
                    <span className={cn("text-sm font-mono", incident.status !== "resolved" && "text-red-500")}>
                      {incident.duration}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {incident.status === "active" && (
                          <DropdownMenuItem onClick={() => handleAcknowledge(incident)}>Acknowledge</DropdownMenuItem>
                        )}
                        {incident.status !== "resolved" && (
                          <DropdownMenuItem onClick={() => handleResolve(incident)}>Resolve</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </StandardPage>
  );
}
