import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "../utils";

interface ApiConfigResponse {
  apiKey: string | null;
}

interface UpdateApiConfigResponse {
  apiKey: string | null;
}

// Get API config
export const useGetApiConfig = (siteId: number) => {
  return useQuery({
    queryKey: ["apiConfig", siteId],
    queryFn: async () => {
      const response = await authedFetch<{
        success: boolean;
        data: ApiConfigResponse;
      }>(`/site/${siteId}/api-config`);
      return response.data;
    },
    enabled: !!siteId,
  });
};

// Generate API key
export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: number) => {
      const response = await authedFetch<{
        success: boolean;
        data: UpdateApiConfigResponse;
      }>(
        `/site/${siteId}/api-config`,
        {},
        {
          method: "POST",
          data: { action: "generate_api_key" },
        }
      );
      return response.data;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ["apiConfig", siteId] });
    },
  });
};

// Revoke API key
export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: number) => {
      const response = await authedFetch<{
        success: boolean;
        data: UpdateApiConfigResponse;
      }>(
        `/site/${siteId}/api-config`,
        {},
        {
          method: "POST",
          data: { action: "revoke_api_key" },
        }
      );
      return response.data;
    },
    onSuccess: (_, siteId) => {
      queryClient.invalidateQueries({ queryKey: ["apiConfig", siteId] });
    },
  });
};
