import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../lib/const";
import { authedFetch } from "../utils";

export interface UptimeIncident {
  id: number;
  organizationId: string;
  monitorId: number;
  monitorName: string;
  region?: string;
  startTime: string;
  endTime?: string;
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  lastError?: string;
  lastErrorType?: string;
  failureCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GetIncidentsParams {
  status?: "active" | "acknowledged" | "resolved" | "all";
  limit?: number;
  offset?: number;
}

async function getIncidents(params?: GetIncidentsParams) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());

  const queryString = queryParams.toString();
  const url = queryString ? `/uptime/incidents?${queryString}` : "/uptime/incidents";

  return authedFetch<{
    incidents: UptimeIncident[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
    };
  }>(url);
}

async function acknowledgeIncident(incidentId: number) {
  const response = await axios.patch(
    `${BACKEND_URL}/uptime/incidents/${incidentId}/acknowledge`,
    {},
    { withCredentials: true }
  );
  return response.data;
}

async function resolveIncident(incidentId: number) {
  const response = await axios.patch(
    `${BACKEND_URL}/uptime/incidents/${incidentId}/resolve`,
    {},
    { withCredentials: true }
  );
  return response.data;
}

// Hooks
export function useIncidents(params?: GetIncidentsParams) {
  return useQuery({
    queryKey: ["uptime-incidents", params],
    queryFn: () => getIncidents(params),
  });
}

export function useAcknowledgeIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgeIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-incidents"] });
    },
  });
}

export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uptime-incidents"] });
    },
  });
}