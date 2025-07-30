import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../lib/const";
import { authedFetch } from "../utils";

export interface NotificationChannel {
  id: number;
  organizationId: string;
  type: "email" | "discord" | "slack" | "sms";
  name: string;
  enabled: boolean;
  config: {
    email?: string;
    webhookUrl?: string;
    slackWebhookUrl?: string;
    slackChannel?: string;
    phoneNumber?: string;
    provider?: string;
  };
  monitorIds: number[] | null; // null = all monitors
  triggerEvents: string[];
  cooldownMinutes: number;
  lastNotifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}


// Channels API
async function getChannels() {
  return authedFetch<{ channels: NotificationChannel[] }>("/uptime/notification-channels");
}

async function createChannel(data: {
  type: NotificationChannel["type"];
  name: string;
  config: NotificationChannel["config"];
  monitorIds?: number[] | null;
  triggerEvents?: string[];
  cooldownMinutes?: number;
}) {
  const response = await axios.post(`${BACKEND_URL}/uptime/notification-channels`, data, {
    withCredentials: true,
  });
  return response.data;
}

async function updateChannel(
  id: number,
  data: {
    name?: string;
    enabled?: boolean;
    config?: NotificationChannel["config"];
    monitorIds?: number[] | null;
    triggerEvents?: string[];
    cooldownMinutes?: number;
  }
) {
  const response = await axios.put(`${BACKEND_URL}/uptime/notification-channels/${id}`, data, {
    withCredentials: true,
  });
  return response.data;
}

async function deleteChannel(id: number) {
  const response = await axios.delete(`${BACKEND_URL}/uptime/notification-channels/${id}`, {
    withCredentials: true,
  });
  return response.data;
}

async function testChannel(id: number) {
  const response = await axios.post(
    `${BACKEND_URL}/uptime/notification-channels/${id}/test`,
    {},
    {
      withCredentials: true,
    }
  );
  return response.data;
}


// Hooks
export function useNotificationChannels() {
  return useQuery({
    queryKey: ["notification-channels"],
    queryFn: getChannels,
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
}

export function useUpdateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateChannel>[1] }) =>
      updateChannel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-channels"] });
    },
  });
}

export function useTestChannel() {
  return useMutation({
    mutationFn: testChannel,
  });
}