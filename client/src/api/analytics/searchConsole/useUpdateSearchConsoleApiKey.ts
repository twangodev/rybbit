import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authedFetch } from "@/api/utils";
import { toast } from "sonner";

interface UpdateSearchConsoleApiKeyParams {
  siteId: number;
  apiKey: string;
}

export const useUpdateSearchConsoleApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ siteId, apiKey }: UpdateSearchConsoleApiKeyParams) => {
      const response = await authedFetch<{
        success: boolean;
        data: { searchConsoleApiKey: string };
      }>(`/site/${siteId}/search-console-api-key`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey }),
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the search console API key query
      queryClient.invalidateQueries({
        queryKey: ["searchConsoleApiKey", variables.siteId],
      });
      // Also invalidate the search console data query to refetch with real data
      queryClient.invalidateQueries({
        queryKey: ["searchConsoleData"],
      });
      toast.success("Search Console API key updated successfully");
    },
    onError: (error) => {
      console.error("Error updating Search Console API key:", error);
      toast.error("Failed to update Search Console API key");
    },
  });
};



