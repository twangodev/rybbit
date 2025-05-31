"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { HelpCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useStore } from "../../../../lib/store";
import { PerformanceMetric, usePerformanceStore } from "../performanceStore";
import { useGetPerformanceOverview } from "../../../../api/analytics/useGetPerformanceOverview";
import { PercentileSelector } from "./PercentileSelector";
import {
  getMetricColor,
  formatMetricValue,
  getMetricUnit,
  METRIC_LABELS_SHORT,
} from "../utils/performanceUtils";

const ChangePercentage = ({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) => {
  const change = ((current - previous) / previous) * 100;

  if (previous === 0) {
    if (current === 0) {
      return <div className="text-sm">0%</div>;
    }
    return <div className="text-sm">+999%</div>;
  }

  if (change === 0) {
    return <div className="text-sm">0%</div>;
  }

  // For performance metrics, lower is better, so we reverse the color logic
  return (
    <div
      className={cn(
        "text-xs flex items-center gap-1",
        change < 0 ? "text-green-400" : "text-red-400"
      )}
    >
      {change > 0 ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      {Math.abs(change).toFixed(1)}%
    </div>
  );
};

const Stat = ({
  title,
  id,
  value,
  previous,
  isLoading,
}: {
  title: string;
  id: PerformanceMetric;
  value: number;
  previous: number;
  isLoading: boolean;
}) => {
  const {
    selectedPerformanceMetric,
    setSelectedPerformanceMetric,
    selectedPercentile,
  } = usePerformanceStore();

  // Metric explanations with importance and structured content
  const getMetricInfo = (metric: PerformanceMetric) => {
    switch (metric) {
      case "lcp":
        return {
          importance: "Core Web Vital",
          description:
            "Measures loading performance. LCP marks the time when the largest content element becomes visible in the viewport.",
          threshold: "Good LCP scores are 2.5 seconds or faster.",
        };
      case "cls":
        return {
          importance: "Core Web Vital",
          description:
            "Measures visual stability. CLS quantifies how much visible content shifts during page load.",
          threshold: "Good CLS scores are 0.1 or less.",
        };
      case "inp":
        return {
          importance: "Core Web Vital",
          description:
            "Measures interactivity. INP assesses responsiveness by measuring the time from user interaction to the next paint.",
          threshold: "Good INP scores are 200ms or faster.",
        };
      case "fcp":
        return {
          importance: "Supporting Metric",
          description:
            "Measures perceived loading speed. FCP marks when the first content element becomes visible.",
          threshold: "Good FCP scores are 1.8 seconds or faster.",
        };
      case "ttfb":
        return {
          importance: "Supporting Metric",
          description:
            "Measures server response time. TTFB is the time from request start to when the first byte is received.",
          threshold: "Good TTFB scores are 800ms or faster.",
        };
      default:
        return {
          importance: "Web Vital",
          description: "Web Vitals metric for measuring website performance.",
          threshold: "Check Google's Web Vitals documentation for thresholds.",
        };
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col cursor-pointer border-r border-neutral-800 last:border-r-0 text-nowrap",
        selectedPerformanceMetric === id && "bg-neutral-850"
      )}
      onClick={() => setSelectedPerformanceMetric(id)}
    >
      <div className="flex flex-col px-3 py-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {title}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-neutral-300 hover:text-neutral-100 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs p-3">
                {(() => {
                  const metricInfo = getMetricInfo(id);
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                          {metricInfo.importance}
                        </span>
                        {metricInfo.importance === "Core Web Vital" && (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-200 leading-relaxed">
                        {metricInfo.description}
                      </p>
                      <div className="pt-1 border-t border-neutral-700">
                        <p className="text-xs text-neutral-400 italic">
                          {metricInfo.threshold}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-2xl font-medium flex gap-2 items-center justify-between">
          {isLoading ? (
            <>
              <Skeleton className="w-[60px] h-9 rounded-md" />
              <Skeleton className="w-[50px] h-5 rounded-md" />
            </>
          ) : (
            <>
              <span className={getMetricColor(id, value)}>
                <NumberFlow
                  respectMotionPreference={false}
                  value={Number(formatMetricValue(id, value))}
                  format={{ notation: "compact" }}
                />
                <span className="text-sm ml-1">{getMetricUnit(id, value)}</span>
              </span>
              <ChangePercentage current={value} previous={previous} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export function PerformanceOverview() {
  const { site } = useStore();
  const { selectedPercentile } = usePerformanceStore();

  const { data: overviewData, isLoading: isOverviewLoading } =
    useGetPerformanceOverview({ site });

  const { data: overviewDataPrevious, isLoading: isOverviewLoadingPrevious } =
    useGetPerformanceOverview({ site, periodTime: "previous" });

  const isLoading = isOverviewLoading || isOverviewLoadingPrevious;

  const currentData = overviewData?.data ?? {};
  const previousData = overviewDataPrevious?.data ?? {};

  // Helper function to get metric value for selected percentile
  const getMetricValue = (data: any, metric: PerformanceMetric): number => {
    const key = `${metric}_${selectedPercentile}`;
    return data[key] ?? 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Web Vitals</h2>
        <PercentileSelector />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-0 items-center border border-neutral-800 rounded-lg overflow-hidden">
        <Stat
          title="Largest Contentful Paint"
          id="lcp"
          value={getMetricValue(currentData, "lcp")}
          previous={getMetricValue(previousData, "lcp")}
          isLoading={isLoading}
        />
        <Stat
          title="Cumulative Layout Shift"
          id="cls"
          value={getMetricValue(currentData, "cls")}
          previous={getMetricValue(previousData, "cls")}
          isLoading={isLoading}
        />
        <Stat
          title="Interaction to Next Paint"
          id="inp"
          value={getMetricValue(currentData, "inp")}
          previous={getMetricValue(previousData, "inp")}
          isLoading={isLoading}
        />
        <Stat
          title="First Contentful Paint"
          id="fcp"
          value={getMetricValue(currentData, "fcp")}
          previous={getMetricValue(previousData, "fcp")}
          isLoading={isLoading}
        />
        <Stat
          title="Time to First Byte"
          id="ttfb"
          value={getMetricValue(currentData, "ttfb")}
          previous={getMetricValue(previousData, "ttfb")}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
