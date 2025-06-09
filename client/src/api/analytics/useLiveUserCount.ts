import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../lib/store";
import { authedFetchWithError } from "../utils";

export interface LiveUserCountResponse {
  count: number;
}

export function useGetLiveUsercount(minutes = 5) {
  const { site } = useStore();
  return useQuery<LiveUserCountResponse>({
    queryKey: ["live-user-count", site, minutes],
    refetchInterval: 5000,
    queryFn: () =>
      authedFetchWithError<LiveUserCountResponse>(`/live-user-count/${site}`, {
        minutes,
      }),
  });
}
