export type GoalType = "path" | "event";

export interface GoalConfig {
  pathPattern?: string;
  eventName?: string;
  eventPropertyKey?: string;
  eventPropertyValue?: string | number | boolean;
}

export interface BaseGoal {
  goalId: number;
  name: string | null;
  goalType: GoalType;
  config: GoalConfig;
  createdAt: string;
}

export interface Goal extends BaseGoal {
  total_conversions?: number;
  total_sessions?: number;
  conversion_rate?: number;
}