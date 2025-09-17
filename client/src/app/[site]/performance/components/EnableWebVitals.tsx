"use client";

import { Gauge } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { updateSiteConfig, useGetSite } from "../../../../api/admin/sites";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";

export function EnableWebVitals() {
  const params = useParams();
  const siteId = Number(params.site);
  const { data: siteMetadata, refetch } = useGetSite(siteId);

  if (siteMetadata?.webVitals) return null;

  return (
    <Alert className="p-4 bg-neutral-50/50 border-amber-200/50 dark:bg-neutral-800/25 dark:border-amber-600/80">
      <div className="flex items-start space-x-3">
        <Gauge className="h-5 w-5 mt-0.5 text-neutral-100" />
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1 text-neutral-700/90 dark:text-neutral-100">
            Web Vitals Collection is Disabled
          </AlertTitle>
          <AlertDescription className="text-sm text-neutral-700/80 dark:text-neutral-300/80">
            <div className="mb-2">
              Web Vitals collection provides Core Web Vitals metrics like LCP, CLS, and INP. <b>Note:</b> Enabling Web
              Vitals will increase your event usage.
            </div>
            <Button
              size="sm"
              variant="success"
              onClick={async () => {
                await updateSiteConfig(siteId, { webVitals: true });
                toast.success("Web Vitals collection enabled");
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
