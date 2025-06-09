import { useQuery } from "@tanstack/react-query";
import { authedFetchWithError } from "../api/utils";

interface Configs {
  disableSignup: boolean;
}

export function useConfigs() {
  const { data, isLoading, error } = useQuery<Configs>({
    queryKey: ["configs"],
    queryFn: () => authedFetchWithError<Configs>("/config"),
  });

  return {
    configs: data,
    isLoading,
    error,
  };
}
