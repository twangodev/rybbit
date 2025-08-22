import { useMutation, useQuery } from "@tanstack/react-query";
import { authedFetch } from "@/api/utils";
import { toast } from "sonner";

interface OAuthUrlResponse {
  authUrl: string;
}

interface ConnectionStatusResponse {
  isConnected: boolean;
}

export const useGetOAuthUrl = () => {
  return useMutation({
    mutationFn: async (siteId: number) => {
      const response = await authedFetch<{
        success: boolean;
        data: OAuthUrlResponse;
      }>(`/site/${siteId}/search-console/oauth/url`);
      return response.data;
    },
    onError: (error) => {
      console.error("Error getting OAuth URL:", error);
      toast.error("Failed to generate OAuth URL");
    },
  });
};

export const useGetConnectionStatus = (siteId: number) => {
  return useQuery({
    queryKey: ["searchConsoleConnectionStatus", siteId],
    queryFn: async () => {
      const response = await authedFetch<{
        success: boolean;
        data: ConnectionStatusResponse;
      }>(`/site/${siteId}/search-console/connection-status`);
      return response.data;
    },
    enabled: !!siteId,
  });
};

export const useDisconnectSearchConsole = () => {
  return useMutation({
    mutationFn: async (siteId: number) => {
      const response = await authedFetch<{
        success: boolean;
        message: string;
      }>(`/site/${siteId}/search-console/disconnect`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Search Console disconnected successfully");
    },
    onError: (error) => {
      console.error("Error disconnecting Search Console:", error);
      toast.error("Failed to disconnect Search Console");
    },
  });
};
