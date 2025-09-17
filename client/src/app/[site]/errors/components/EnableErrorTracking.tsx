"use client";

import { AlertTriangle } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { updateSiteConfig, useGetSite } from "../../../../api/admin/sites";
import { useGetErrorNames } from "../../../../api/analytics/errors/useGetErrorNames";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";

export function EnableErrorTracking() {
  const params = useParams();
  const siteId = Number(params.site);
  const { data: siteMetadata, refetch } = useGetSite(siteId);
  const { data: errorData, isLoading, isError } = useGetErrorNames({ limit: 1 });

  // Don't show banner while loading, if there's an error, or if error tracking is already enabled
  if (isLoading || isError || siteMetadata?.trackErrors) return null;

  const errors = errorData?.data ?? [];

  // Only show banner if there are no errors tracked
  if (errors.length > 0) return null;

  return (
    <Alert className="p-4 bg-neutral-50/50 border-neutral-200/50 dark:bg-neutral-800/25 dark:border-neutral-700/70">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 text-neutral-300" />
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1 text-neutral-700/90 dark:text-neutral-300">
            Error Tracking is Disabled
          </AlertTitle>
          <AlertDescription className="text-sm text-neutral-700/80 dark:text-neutral-300/80">
            <div className="mb-2">
              Error tracking captures JavaScript errors and exceptions from your application. <b>Note:</b> Enabling
              error tracking will increase your event usage.
            </div>
            <Button
              size="sm"
              variant="success"
              onClick={async () => {
                await updateSiteConfig(siteId, { trackErrors: true });
                toast.success("Error tracking enabled");
                refetch();
              }}
            >
              Enable
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
