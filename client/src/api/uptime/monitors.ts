import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "../utils";
import axios from "axios";
import { BACKEND_URL } from "../../lib/const";
import { DateTime } from "luxon";

export interface UptimeMonitor {
  id: number;
  organizationId: string;
  name: string;
  monitorType: "http" | "tcp";
  intervalSeconds: number;
  enabled: boolean;
  httpConfig?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    auth?: {
      type: "none" | "basic" | "bearer" | "api_key" | "custom_header";
      credentials?: {
        username?: string;
        password?: string;
        token?: string;
        headerName?: string;
        headerValue?: string;
      };
    };
    followRedirects?: boolean;
    timeoutMs?: number;
    ipVersion?: "any" | "ipv4" | "ipv6";
    userAgent?: string;
  };
  tcpConfig?: {
    host: string;
    port: number;
    timeoutMs?: number;
  };
  validationRules: Array<any>;
  regions: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  status?: {
    monitorId: number;
    lastCheckedAt?: string;
    currentStatus: "up" | "down" | "unknown";
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    uptimePercentage24h?: number;
    uptimePercentage7d?: number;
    uptimePercentage30d?: number;
    updatedAt: string;
  };
}

export interface MonitorStats {
  interval: string;
  startTime: string;
  endTime: string;
  region?: string;
  stats: {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    timeoutChecks: number;
    uptimePercentage: number;
    responseTime: {
      avg: number;
      min: number;
      max: number;
      p50: number;
      p95: number;
      p99: number;
    };
  };
  distribution: Array<{
    hour: string;
    avg_response_time: number;
    check_count: number;
    success_count: number;
  }>;
}

export interface MonitorEvent {
  monitor_id: number;
  organization_id: string;
  timestamp: string;
  monitor_type: string;
  monitor_url: string;
  monitor_name: string;
  region: string;
  status: "success" | "failure" | "timeout";
  status_code?: number;
  response_time_ms: number;
  dns_time_ms?: number;
  tcp_time_ms?: number;
  tls_time_ms?: number;
  ttfb_ms?: number;
  transfer_time_ms?: number;
  validation_errors?: Array<any>;
  response_headers?: Record<string, string>;
  response_size_bytes?: number;
  port?: number;
  error_message?: string;
  error_type?: string;
}

async function getMonitors(params?: { 
  organizationId?: string; 
  enabled?: boolean; 
  monitorType?: "http" | "tcp";
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.organizationId) queryParams.append("organizationId", params.organizationId);
  if (params?.enabled !== undefined) queryParams.append("enabled", params.enabled.toString());
  if (params?.monitorType) queryParams.append("monitorType", params.monitorType);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `/uptime/monitors?${queryString}` : "/uptime/monitors";
  
  return authedFetch<UptimeMonitor[]>(url);
}

async function getMonitor(monitorId: number) {
  return authedFetch<UptimeMonitor>(`/uptime/monitors/${monitorId}`);
}

async function getMonitorStats(monitorId: number, params?: {
  startTime?: string;
  endTime?: string;
  region?: string;
  interval?: "1h" | "6h" | "24h" | "7d" | "30d";
}) {
  const queryParams = new URLSearchParams();
  if (params?.startTime) queryParams.append("startTime", params.startTime);
  if (params?.endTime) queryParams.append("endTime", params.endTime);
  if (params?.region) queryParams.append("region", params.region);
  if (params?.interval) queryParams.append("interval", params.interval);
  
  const queryString = queryParams.toString();
  const url = queryString ? `/uptime/monitors/${monitorId}/stats?${queryString}` : `/uptime/monitors/${monitorId}/stats`;
  
  return authedFetch<MonitorStats>(url);
}

async function getMonitorEvents(monitorId: number, params?: {
  startTime?: string;
  endTime?: string;
  status?: "success" | "failure" | "timeout";
  region?: string;
  limit?: number;
  offset?: number;
}) {
  const queryParams = new URLSearchParams();
  if (params?.startTime) queryParams.append("startTime", params.startTime);
  if (params?.endTime) queryParams.append("endTime", params.endTime);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.region) queryParams.append("region", params.region);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  
  const queryString = queryParams.toString();
  const url = queryString ? `/uptime/monitors/${monitorId}/events?${queryString}` : `/uptime/monitors/${monitorId}/events`;
  
  return authedFetch<{
    events: MonitorEvent[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  }>(url);
}

// Hooks
export function useMonitors(params?: Parameters<typeof getMonitors>[0]) {
  return useQuery({
    queryKey: ["uptime-monitors", params],
    queryFn: () => getMonitors(params),
  });
}

export function useMonitor(monitorId: number | undefined) {
  return useQuery({
    queryKey: ["uptime-monitor", monitorId],
    queryFn: () => monitorId ? getMonitor(monitorId) : Promise.reject("No monitor ID"),
    enabled: !!monitorId,
  });
}

export function useMonitorStats(monitorId: number | undefined, params?: Parameters<typeof getMonitorStats>[1]) {
  return useQuery({
    queryKey: ["uptime-monitor-stats", monitorId, params],
    queryFn: () => monitorId ? getMonitorStats(monitorId, params) : Promise.reject("No monitor ID"),
    enabled: !!monitorId,
  });
}

export function useMonitorEvents(monitorId: number | undefined, params?: Parameters<typeof getMonitorEvents>[1]) {
  return useQuery({
    queryKey: ["uptime-monitor-events", monitorId, params],
    queryFn: () => monitorId ? getMonitorEvents(monitorId, params) : Promise.reject("No monitor ID"),
    enabled: !!monitorId,
  });
}

// Hook to fetch events for all monitors (used in the monitors table)
export function useAllMonitorEvents(monitors: UptimeMonitor[]) {
  const sevenDaysAgo = DateTime.now().minus({ days: 7 }).toISODate();
  
  return useQuery({
    queryKey: ["uptime-all-monitor-events", monitors.map(m => m.id), sevenDaysAgo],
    queryFn: async () => {
      const eventsMap: Record<number, MonitorEvent[]> = {};
      
      // Fetch events for all monitors in parallel
      const promises = monitors.map(async (monitor) => {
        try {
          const response = await fetch(
            `${BACKEND_URL}/uptime/monitors/${monitor.id}/events?startTime=${sevenDaysAgo}&limit=1000`,
            {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            eventsMap[monitor.id] = data.events || [];
          }
        } catch (error) {
          console.error(`Failed to fetch events for monitor ${monitor.id}:`, error);
          eventsMap[monitor.id] = [];
        }
      });
      
      await Promise.all(promises);
      return eventsMap;
    },
    enabled: monitors.length > 0,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Mutations
export interface CreateMonitorInput {
  organizationId: string;
  name: string;
  monitorType: "http" | "tcp";
  intervalSeconds: number;
  enabled?: boolean;
  httpConfig?: UptimeMonitor["httpConfig"];
  tcpConfig?: UptimeMonitor["tcpConfig"];
  validationRules?: Array<any>;
  regions?: string[];
}

export interface UpdateMonitorInput {
  name?: string;
  intervalSeconds?: number;
  enabled?: boolean;
  httpConfig?: UptimeMonitor["httpConfig"];
  tcpConfig?: UptimeMonitor["tcpConfig"];
  validationRules?: Array<any>;
  regions?: string[];
}

async function createMonitor(data: CreateMonitorInput) {
  const response = await axios.post(`${BACKEND_URL}/uptime/monitors`, data, {
    withCredentials: true,
  });
  return response.data;
}

async function updateMonitor(monitorId: number, data: UpdateMonitorInput) {
  const response = await axios.put(`${BACKEND_URL}/uptime/monitors/${monitorId}`, data, {
    withCredentials: true,
  });
  return response.data;
}

async function deleteMonitor(monitorId: number) {
  const response = await axios.delete(`${BACKEND_URL}/uptime/monitors/${monitorId}`, {
    withCredentials: true,
  });
  return response.data;
}

export function useCreateMonitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createMonitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
    },
  });
}

export function useUpdateMonitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ monitorId, data }: { monitorId: number; data: UpdateMonitorInput }) => 
      updateMonitor(monitorId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
      queryClient.invalidateQueries({ queryKey: ["uptime-monitor", variables.monitorId] });
    },
  });
}

export function useDeleteMonitor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteMonitor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-monitors"] });
    },
  });
}