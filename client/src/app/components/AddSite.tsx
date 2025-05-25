"use client";
import { Button } from "@/components/ui/button";
import { AlertCircle, AppWindow, Building2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { addSite, useGetSites } from "../../api/admin/sites";
import { useStripeSubscription } from "../settings/subscription/utils/useStripeSubscription";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { authClient } from "../../lib/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { IS_CLOUD } from "../../lib/const";

/**
 * A simple domain validation function:
 * - Ensures at least one dot separator
 * - Allows subdomains (e.g. sub.example.com)
 * - Requires the TLD to be alphabetical (e.g. .com)
 */
function isValidDomain(domain: string): boolean {
  const domainRegex =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

export function AddSite({
  trigger,
  disabled,
}: {
  trigger?: React.ReactNode;
  disabled?: boolean;
}) {
  const { data: sites, refetch } = useGetSites();
  const { data: organizations } = authClient.useListOrganizations();
  const { data: subscription } = useStripeSubscription();

  const existingSites = sites?.map((site) => site.domain);

  // Disable if user is on free plan and has 3+ sites
  const isDisabledDueToLimit =
    subscription?.status !== "active" && (sites?.length || 0) >= 3 && IS_CLOUD;
  const finalDisabled = disabled || isDisabledDueToLimit;

  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState("");
  const [selectedOrganizationId, setSelectedOrganizationId] =
    useState<string>("");
  const [isPublic, setIsPublic] = useState(false);
  const [saltUserIds, setSaltUserIds] = useState(false);
  const [error, setError] = useState("");

  // Set the first organization as the default selection when organizations are loaded
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(organizations[0].id);
    }
  }, [organizations, selectedOrganizationId]);

  const domainMatchesExistingSites = existingSites?.includes(domain);

  const handleSubmit = async () => {
    setError("");

    if (!selectedOrganizationId) {
      setError("Please select an organization");
      return;
    }

    // Validate before attempting to add
    if (!isValidDomain(domain)) {
      setError(
        "Invalid domain format. Must be a valid domain like example.com or sub.example.com"
      );
      return;
    }

    try {
      await addSite(domain, domain, selectedOrganizationId, {
        isPublic,
        saltUserIds,
      });
    } catch (error) {
      setError("Failed to add site");
      return;
    }

    setOpen(false);
    refetch();
  };

  const resetForm = () => {
    setDomain("");
    setError("");
    setIsPublic(false);
    setSaltUserIds(false);
    // Reset organization to first one when opening dialog
    if (organizations && organizations.length > 0) {
      setSelectedOrganizationId(organizations[0].id);
    }
  };

  // Show upgrade message if disabled due to limit
  if (isDisabledDueToLimit) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button disabled title="Upgrade to Pro to add more websites">
              <Plus className="h-4 w-4" />
              Add Website
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Upgrade to Pro to add more websites</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (isOpen) {
            resetForm();
          }
        }}
      >
        <DialogTrigger asChild>
          {trigger || (
            <Button disabled={finalDisabled}>
              <Plus className="h-4 w-4" />
              Add Website
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AppWindow className="h-6 w-6" />
              Add Website
            </DialogTitle>
            <DialogDescription>
              Track analytics for a new website in your organization
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="domain"
                className="text-sm font-medium text-white"
              >
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value.toLowerCase())}
                placeholder="example.com or sub.example.com"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="organization"
                className="text-sm font-medium text-white"
              >
                Organization
              </Label>
              <Select
                value={selectedOrganizationId}
                onValueChange={setSelectedOrganizationId}
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
            </div>

            {/* Public Analytics Setting */}
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-white"
                >
                  Public Analytics
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, anyone can view analytics without logging in
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            {/* User ID Salting Setting */}
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="saltUserIds"
                  className="text-sm font-medium text-white"
                >
                  Enable User ID Salting
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enhance privacy with daily rotating salts for user IDs
                </p>
              </div>
              <Switch
                id="saltUserIds"
                checked={saltUserIds}
                onCheckedChange={setSaltUserIds}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Adding Website</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={"success"}
              onClick={handleSubmit}
              disabled={
                !domain || domainMatchesExistingSites || !selectedOrganizationId
              }
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
