import { Filter } from "@rybbit/shared";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/const";
import { FunnelStep } from "./useGetFunnel";
import { authedFetchWithError } from "../utils";

export interface SavedFunnel {
  id: number;
  name: string;
  steps: FunnelStep[];
  filters?: Filter[];
  createdAt: string;
  updatedAt: string;
  conversionRate: number | null;
  totalVisitors: number | null;
}

export function useGetFunnels(siteId?: string | number) {
  return useQuery<SavedFunnel[]>({
    queryKey: ["funnels", siteId],
    queryFn: async () => {
      if (!siteId) {
        return [];
      }
      try {
        const response = await authedFetchWithError<{ data: SavedFunnel[] }>(
          `${BACKEND_URL}/funnels/${siteId}`
        );
        return response.data;
      } catch (error) {
        throw new Error("Failed to fetch funnels");
      }
    },
    enabled: !!siteId,
  });
}
