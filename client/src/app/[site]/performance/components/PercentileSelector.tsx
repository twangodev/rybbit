"use client";

import { cn } from "@/lib/utils";
import { PercentileLevel, useStore } from "../../../../lib/store";

const PERCENTILE_OPTIONS: { value: PercentileLevel; label: string }[] = [
  { value: "p50", label: "P50" },
  { value: "p75", label: "P75" },
  { value: "p90", label: "P90" },
  { value: "p99", label: "P99" },
];

export function PercentileSelector() {
  const { selectedPercentile, setSelectedPercentile } = useStore();

  return (
    <div className="flex items-center space-x-1 bg-neutral-800 rounded-lg p-1">
      {PERCENTILE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => setSelectedPercentile(option.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
            selectedPercentile === option.value
              ? "bg-neutral-700 text-white"
              : "text-neutral-400 hover:text-white hover:bg-neutral-750"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
