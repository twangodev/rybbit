"use client";

import { Video } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { updateSiteConfig, useGetSite } from "../../../../api/admin/sites";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";

export function EnableSessionReplay() {
  const params = useParams();
  const siteId = Number(params.site);
  const { data: siteMetadata, isLoading, refetch } = useGetSite(siteId);

  if (isLoading || siteMetadata?.sessionReplay) return null;

  return (
    <Alert className="p-4 bg-neutral-50/50 border-neutral-200/50 dark:bg-neutral-800/25 dark:border-neutral-700/70">
      <div className="flex items-start space-x-3">
        <Video className="h-5 w-5 mt-0.5 text-neutral-300" />
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1 text-neutral-700/90 dark:text-neutral-300">
            Session Replay is Disabled
          </AlertTitle>
          <AlertDescription className="text-sm text-neutral-700/80 dark:text-neutral-300/80">
            <div className="mb-2">
              Session replay will make the analytics script <b>8x larger</b> and the client will send significantly more
              and larger payloads. <b>Only enable this if you will actually use it.</b>
            </div>
            <Button
              size="sm"
              variant="success"
              onClick={async () => {
                await updateSiteConfig(siteId, { sessionReplay: true });
                toast.success("Session replay enabled");
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
