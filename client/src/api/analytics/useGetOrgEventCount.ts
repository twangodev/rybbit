import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../utils";

export type OrgEventCountResponse = {
  event_date: string;
  event_count: number;
}[];

export type GetOrgEventCountResponse = {
  data: OrgEventCountResponse;
};

async function getOrgEventCount({
  organizationId,
  startDate,
  endDate,
  timeZone = "UTC",
}: {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
}): Promise<GetOrgEventCountResponse> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (timeZone) params.append("timeZone", timeZone);

  return authedFetch(
    `/org-event-count/${organizationId}`,
    Object.fromEntries(params)
  );
}

export function useGetOrgEventCount({
  organizationId,
  startDate,
  endDate,
  timeZone = "UTC",
  enabled = true,
}: {
  organizationId: string;
  startDate?: string;
  endDate?: string;
  timeZone?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["org-event-count", organizationId, startDate, endDate, timeZone],
    queryFn: () =>
      getOrgEventCount({
        organizationId,
        startDate,
        endDate,
        timeZone,
      }),
    enabled: enabled && !!organizationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
