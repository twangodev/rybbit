import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../../lib/const";

interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
  domain: string;
  isExisting: boolean;
}

interface GetSearchConsoleSitesResponse {
  success: boolean;
  data: SearchConsoleSite[];
}

export function useGetSearchConsoleSites(siteId: number) {
  return useQuery({
    queryKey: ["get-search-console-sites", siteId],
    queryFn: async (): Promise<SearchConsoleSite[]> => {
      console.log(`Frontend: Making request to get Search Console sites for siteId: ${siteId}`);
      const url = `${BACKEND_URL}/site/${siteId}/search-console/sites`;
      console.log(`Frontend: Request URL: ${url}`);
      
      const response = await axios.get<GetSearchConsoleSitesResponse>(
        url,
        {
          withCredentials: true,
        }
      );

      console.log(`Frontend: Response status: ${response.status}`);
      console.log(`Frontend: Response data:`, response.data);

      if (!response.data.success) {
        throw new Error("Failed to get Search Console sites");
      }

      console.log(`Frontend: Returning ${response.data.data.length} sites`);
      return response.data.data;
    },
    enabled: !!siteId,
  });
}
