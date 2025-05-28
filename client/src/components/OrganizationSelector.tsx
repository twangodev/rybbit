import { Building2 } from "lucide-react";
import { authClient } from "../lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function OrganizationSelector() {
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrganization, isPending } =
    authClient.useActiveOrganization();

  if (!activeOrganization) {
    return null;
  }

  return (
    <Select
      value={activeOrganization?.id}
      onValueChange={(organizationId) =>
        authClient.organization.setActive({
          organizationId,
        })
      }
      disabled={!organizations || organizations.length === 0}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations?.map((org) => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              {org.name}
            </div>
          </SelectItem>
        ))}
        {(!organizations || organizations.length === 0) && (
          <SelectItem value="no-org" disabled>
            No organizations available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
