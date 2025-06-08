import { TimeBucket } from "@rybbit/shared";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/const";
import { timeZone } from "../../lib/dateTimeUtils";
import { APIResponse } from "../types";
import { authedFetch } from "../utils";
import { GetOverviewBucketedResponse } from "./useGetOverviewBucketed";

/**
 * A wrapper around useGetOverviewBucketedPastMinutes that adds support for
 * conditional fetching based on viewport visibility
 */
export function useGetOverviewBucketedWithInView({
  pastMinutes = 24 * 60,
  site,
  bucket = "hour",
  isInView = true,
  refetchInterval,
}: {
  pastMinutes?: number;
  site?: number | string;
  bucket?: TimeBucket;
  isInView?: boolean;
  refetchInterval?: number;
}) {
  return useQuery<APIResponse<GetOverviewBucketedResponse>>({
    queryKey: ["overview-bucketed-past-minutes", pastMinutes, site, bucket],
    queryFn: () => {
      return authedFetch(`${BACKEND_URL}/overview-bucketed/${site}`, {
        timeZone,
        bucket,
        pastMinutes,
      }).then((res) => res.json());
    },
    refetchInterval: isInView ? refetchInterval : 0,
    enabled: isInView,
    staleTime: Infinity,
    placeholderData: (_, query: any) => {
      if (!query?.queryKey) return undefined;
      const prevQueryKey = query.queryKey as [string, string, string];
      const [, , prevSite] = prevQueryKey;

      if (prevSite === site) {
        return query.state.data;
      }
      return undefined;
    },
  });
}
