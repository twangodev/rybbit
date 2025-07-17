import { useQuery } from "@tanstack/react-query";
import { authedFetch } from "../utils";
import { authClient } from "../../lib/auth";

type UserOrganization = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
  metadata: string | null;
  role: string;
};

function getUserOrganizations(): Promise<UserOrganization[]> {
  return authedFetch("/user/organizations");
}

export const USER_ORGANIZATIONS_QUERY_KEY = "userOrganizations";

export function useUserOrganizations() {
  return useQuery({
    queryKey: [USER_ORGANIZATIONS_QUERY_KEY],
    queryFn: getUserOrganizations,
  });
}

export function useOrganizationInvitations(organizationId: string) {
  return useQuery({
    queryKey: ["invitations", organizationId],
    queryFn: async () => {
      const invitations = await authClient.organization.listInvitations({
        query: {
          organizationId,
        },
      });

      if (invitations.error) {
        throw new Error(invitations.error.message);
      }

      return invitations.data;
    },
  });
}
