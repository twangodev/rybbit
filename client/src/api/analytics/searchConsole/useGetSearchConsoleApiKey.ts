import { authedFetch } from "@/api/utils";
import { useQuery } from "@tanstack/react-query";

interface SearchConsoleApiKeyResponse {
  searchConsoleApiKey: string | null;
  isConnected: boolean;
}

export const useGetSearchConsoleApiKey = (siteId: number) => {
  return useQuery({
    queryKey: ["searchConsoleApiKey", siteId],
    queryFn: async () => {
      const response = await authedFetch<{
        success: boolean;
        data: SearchConsoleApiKeyResponse;
      }>(`/site/${siteId}/search-console-api-key`);
      return response.data;
    },
    enabled: !!siteId,
  });
};



