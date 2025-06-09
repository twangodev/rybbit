import { useQuery } from "@tanstack/react-query";
import { useStore } from "../../lib/store";
import { authedFetchWithError } from "../utils";

export function useGetLiveUsercount(minutes = 5) {
  const { site } = useStore();
  return useQuery({
    queryKey: ["live-user-count", site, minutes],
    refetchInterval: 5000,
    queryFn: () =>
      authedFetchWithError(`/live-user-count/${site}`, { minutes }),
  });
}
