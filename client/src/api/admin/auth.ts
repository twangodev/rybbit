import { useQuery } from "@tanstack/react-query";
import { authedFetchWithError } from "../utils";

type GetOrganizationMembersResponse = {
  data: {
    id: string;
    role: string;
    userId: string;
    organizationId: string;
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  }[];
};

export const useOrganizationMembers = (organizationId: string) => {
  return useQuery<GetOrganizationMembersResponse>({
    queryKey: ["organization-members", organizationId],
    queryFn: () =>
      authedFetchWithError(`/list-organization-members/${organizationId}`),
    staleTime: Infinity,
  });
};
