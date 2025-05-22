import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/const";
import { authedFetchWithError } from "../utils";

export interface AdminUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  monthlyEventCount: number;
  sites: {
    siteId: number;
    name: string;
    domain: string;
    createdAt: string;
  }[];
}

export async function getAdminUsers() {
  return authedFetchWithError<AdminUserData[]>(`${BACKEND_URL}/admin/users`);
}

export function useAdminUsers() {
  return useQuery<AdminUserData[]>({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
    staleTime: 60000, // 1 minute
  });
}
