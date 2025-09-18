import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../utils";

export interface AdminSiteData {
  siteId: number;
  domain: string;
  createdAt: string;
  public: boolean;
  eventsLast24Hours: number;
  eventsLast30Days: number;
  organizationOwnerEmail: string | null;
  subscription: {
    planName: string;
    status: string;
  };
}

async function getAdminSites() {
  return authedFetch<AdminSiteData[]>("/admin/sites");
}

export function useAdminSites() {
  return useQuery<AdminSiteData[]>({
    queryKey: ["admin-sites"],
    queryFn: getAdminSites,
  });
}
