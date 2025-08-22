import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../../lib/const";

interface AddSitesFromSearchConsoleResponse {
  success: boolean;
  data: {
    added: string[];
    existing: string[];
    errors: string[];
  };
}

export function useAddSitesFromSearchConsole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: number): Promise<AddSitesFromSearchConsoleResponse> => {
      console.log("Making request to add sites from Search Console for siteId:", siteId);
      const url = `${BACKEND_URL}/site/${siteId}/search-console/add-sites`;
      console.log("Request URL:", url);
      
      const response = await axios({
        url,
        method: "POST",
        withCredentials: true,
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.status >= 200 && response.status < 300);

      if (response.status < 200 || response.status >= 300) {
        const errorData = response.data;
        console.error("Error response data:", errorData);
        throw new Error(errorData.error || "Failed to add sites from Search Console");
      }

      const result = response.data;
      console.log("Success response data:", result);
      return result;
    },
    onSuccess: () => {
      // Invalidate relevant queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["get-sites-from-org"] });
    },
  });
}
