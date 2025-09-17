"use client";

import { BarChart3 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { updateSiteConfig, useGetSite } from "../../../../api/admin/sites";
import { useGetPerformanceOverview } from "../../../../api/analytics/performance/useGetPerformanceOverview";
import { Alert, AlertDescription, AlertTitle } from "../../../../components/ui/alert";
import { Button } from "../../../../components/ui/button";
import { useStore } from "../../../../lib/store";
import { usePerformanceStore } from "../performanceStore";

export function EnableWebVitals() {
  const params = useParams();
  const siteId = Number(params.site);
  const { site } = useStore();
  const { selectedPercentile } = usePerformanceStore();
  const { data: siteMetadata, refetch } = useGetSite(siteId);

  const { data: overviewData, isLoading, isError } = useGetPerformanceOverview({ site });

  // Don't show banner while loading, if there's an error, or if web vitals is already enabled
  if (isLoading || isError || siteMetadata?.webVitals) return null;

  const currentData = overviewData?.data ?? {};

  // Helper function to get metric value for selected percentile
  const getMetricValue = (metric: string): number => {
    const key = `${metric}_${selectedPercentile}`;
    return (currentData as any)[key] ?? 0;
  };

  // Check if all web vitals metrics are zero (indicating no data)
  const hasNoWebVitalsData =
    getMetricValue("lcp") === 0 &&
    getMetricValue("cls") === 0 &&
    getMetricValue("inp") === 0 &&
    getMetricValue("fcp") === 0 &&
    getMetricValue("ttfb") === 0;

  // Only show banner if there's no web vitals data
  if (!hasNoWebVitalsData) return null;

  return (
    <Alert className="p-4 bg-neutral-50/50 border-neutral-200/50 dark:bg-neutral-800/25 dark:border-neutral-700/70">
      <div className="flex items-start space-x-3">
        <BarChart3 className="h-5 w-5 mt-0.5 text-neutral-300" />
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold mb-1 text-neutral-700/90 dark:text-neutral-300">
            Web Vitals Collection is Disabled
          </AlertTitle>
          <AlertDescription className="text-sm text-neutral-700/80 dark:text-neutral-300/80">
            <div className="mb-2">
              Web Vitals collection provides Core Web Vitals metrics like LCP, CLS, and INP. <b>Note:</b> Enabling Web Vitals will increase your event usage.
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
