import { create } from "zustand";
import { TimeBucket } from "./UptimeBucketSelection";

export const TIME_RANGES = [
  { value: "24h", label: "24H" },
  { value: "3d", label: "3D" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "all", label: "All Time" },
] as const;

export const useUptimeStore = create<{
  timeRange: (typeof TIME_RANGES)[number]["value"];
  setTimeRange: (timeRange: (typeof TIME_RANGES)[number]["value"]) => void;
  bucket: TimeBucket;
  setBucket: (bucket: TimeBucket) => void;
}>((set) => ({
  timeRange: "24h",
  setTimeRange: (timeRange) => set({ timeRange }),
  bucket: "hour",
  setBucket: (bucket) => set({ bucket }),
}));
