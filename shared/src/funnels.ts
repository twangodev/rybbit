import { Filter } from "./filters";

export type FunnelStepType = "pageview" | "event";

export interface FunnelStep {
  type: FunnelStepType;
  path?: string;
  eventName?: string;
  eventPropertyKey?: string;
  eventPropertyValue?: string | number | boolean;
}

export interface BaseFunnel {
  id: number;
  name: string;
  steps: FunnelStep[];
  filters?: Filter[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedFunnel extends BaseFunnel {
  conversionRate?: number;
  totalUsers?: number;
  stepResults?: Array<{
    stepNumber: number;
    users: number;
    dropoff: number;
  }>;
}