import { PerformanceMetric, PercentileLevel } from "../performanceStore";

// Performance metric thresholds for color coding based on percentile
// Lower percentiles (P50) have stricter thresholds since they represent typical user experience
// Higher percentiles (P99) have more lenient thresholds since they represent edge cases
const PERFORMANCE_THRESHOLDS = {
  lcp: {
    p50: { good: 2000, needs_improvement: 3000 }, // Stricter for median
    p75: { good: 2500, needs_improvement: 4000 }, // Web Vitals standard
    p90: { good: 3000, needs_improvement: 5000 }, // More lenient
    p99: { good: 4000, needs_improvement: 6000 }, // Most lenient for outliers
  },
  cls: {
    p50: { good: 0.05, needs_improvement: 0.15 }, // Stricter for median
    p75: { good: 0.1, needs_improvement: 0.25 }, // Web Vitals standard
    p90: { good: 0.15, needs_improvement: 0.35 }, // More lenient
    p99: { good: 0.25, needs_improvement: 0.5 }, // Most lenient for outliers
  },
  inp: {
    p50: { good: 150, needs_improvement: 300 }, // Stricter for median
    p75: { good: 200, needs_improvement: 500 }, // Web Vitals standard
    p90: { good: 300, needs_improvement: 700 }, // More lenient
    p99: { good: 500, needs_improvement: 1000 }, // Most lenient for outliers
  },
  fcp: {
    p50: { good: 1200, needs_improvement: 2000 }, // Stricter for median
    p75: { good: 1800, needs_improvement: 3000 }, // Web Vitals standard
    p90: { good: 2500, needs_improvement: 4000 }, // More lenient
    p99: { good: 3500, needs_improvement: 5500 }, // Most lenient for outliers
  },
  ttfb: {
    p50: { good: 500, needs_improvement: 1000 }, // Stricter for median
    p75: { good: 800, needs_improvement: 1800 }, // Web Vitals standard
    p90: { good: 1200, needs_improvement: 2500 }, // More lenient
    p99: { good: 2000, needs_improvement: 4000 }, // Most lenient for outliers
  },
} as const;

/**
 * Get the appropriate color class for a performance metric value based on percentile-aware thresholds
 */
export const getMetricColor = (
  metric: PerformanceMetric,
  value: number,
  percentile: PercentileLevel = "p75"
): string => {
  const thresholds = PERFORMANCE_THRESHOLDS[metric]?.[percentile];

  if (!thresholds) {
    return "text-white";
  }

  if (value <= thresholds.good) {
    return "text-green-400";
  }

  if (value <= thresholds.needs_improvement) {
    return "text-yellow-400";
  }

  return "text-red-400";
};

/**
 * Format a performance metric value for display
 */
export const formatMetricValue = (
  metric: PerformanceMetric,
  value: number
): string => {
  if (metric === "cls") {
    return value.toFixed(3);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2);
  }
  return Math.round(value).toString();
};

/**
 * Get the appropriate unit for a performance metric value
 */
export const getMetricUnit = (
  metric: PerformanceMetric,
  value: number
): string => {
  if (metric === "cls") return "";
  if (value >= 1000) return "s";
  return "ms";
};

/**
 * Get the chart color for a performance metric (used in charts)
 */
export const getMetricChartColor = (metric: PerformanceMetric): string => {
  switch (metric) {
    case "lcp":
      return "#3b82f6"; // blue
    case "cls":
      return "#10b981"; // emerald
    case "inp":
      return "#f59e0b"; // amber
    case "fcp":
      return "#8b5cf6"; // violet
    case "ttfb":
      return "#ef4444"; // red
    default:
      return "#6b7280"; // gray
  }
};

/**
 * Performance metric labels for display
 */
export const METRIC_LABELS: Record<PerformanceMetric, string> = {
  lcp: "Largest Contentful Paint",
  cls: "Cumulative Layout Shift",
  inp: "Interaction to Next Paint",
  fcp: "First Contentful Paint",
  ttfb: "Time to First Byte",
};

/**
 * Short metric labels for compact display
 */
export const METRIC_LABELS_SHORT: Record<PerformanceMetric, string> = {
  lcp: "LCP",
  cls: "CLS",
  inp: "INP",
  fcp: "FCP",
  ttfb: "TTFB",
};

/**
 * Get the performance thresholds for a specific metric and percentile
 */
export const getPerformanceThresholds = (
  metric: PerformanceMetric,
  percentile: PercentileLevel = "p75"
) => {
  return PERFORMANCE_THRESHOLDS[metric]?.[percentile] || null;
};
