"use client";

import { round } from "lodash";
import { FunnelResponse, FunnelStep } from "../../../../api/analytics/funnels/useGetFunnel";
import { EventIcon, PageviewIcon } from "../../../../components/EventIcons";

export type FunnelChartData = {
  stepName: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
  stepNumber: number;
};

interface FunnelProps {
  data?: FunnelResponse[] | undefined;
  isError: boolean;
  error: unknown;
  isPending: boolean;
  steps: FunnelStep[];
}

export function Funnel({ data, steps, isError, error, isPending }: FunnelProps) {
  // Prepare chart data
  const chartData =
    data?.map(step => ({
      stepName: step.step_name,
      visitors: step.visitors,
      conversionRate: step.conversion_rate,
      dropoffRate: step.dropoff_rate,
      stepNumber: step.step_number,
    })) || [];

  // Get first and last data points for total conversion metrics
  const firstStep = chartData[0];
  const lastStep = chartData[chartData.length - 1];
  const totalConversionRate = lastStep?.conversionRate || 0;

  const maxBarWidth = 100; // as percentage

  return (
    <div className="mt-2">
      {isError ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-red-500">
            Error: {error instanceof Error ? error.message : "Failed to analyze funnel"}
          </div>
        </div>
      ) : data && chartData.length > 0 ? (
        <div className="space-y-0">
          {chartData.map((step, index) => {
            // Calculate the percentage width for the bar
            const ratio = firstStep?.visitors ? step.visitors / firstStep.visitors : 0;
            const barWidth = Math.max(ratio * maxBarWidth, 0);

            // For step 2+, calculate the number of users who dropped off
            const prevStep = index > 0 ? chartData[index - 1] : null;
            const droppedUsers = prevStep ? prevStep.visitors - step.visitors : 0;
            const dropoffPercent = prevStep ? (droppedUsers / prevStep.visitors) * 100 : 0;

            return (
              <div key={step.stepNumber} className="relative pb-4">
                {/* Step number indicator */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-xs mr-2">
                    {step.stepNumber}
                  </div>
                  <div className="font-medium text-sm flex items-center gap-2">
                    {steps[index].type === "page" ? <PageviewIcon /> : <EventIcon />}
                    {step.stepName}
                  </div>
                </div>

                {/* Bar and metrics */}
                <div className="flex items-center pl-8">
                  {/* Metrics */}
                  <div className="flex-shrink-0 min-w-[130px] mr-4 space-y-1">
                    <div className="flex items-baseline">
                      <span className="text-base font-semibold">{step.visitors.toLocaleString()}</span>
                      <span className="text-sm text-neutral-400 ml-1">users</span>
                    </div>
                    {index !== 0 && (
                      <div className="flex items-baseline text-orange-500 text-xs font-medium">
                        {droppedUsers.toLocaleString()} dropped
                      </div>
                    )}
                  </div>

                  {/* Bar */}
                  <div className="flex-grow h-10 bg-neutral-800 rounded-md overflow-hidden relative mt-2">
                    {/* Relative conversion bar (from previous step) */}
                    {index > 0 && prevStep && (
                      <div
                        className="absolute h-full rounded-md"
                        style={{
                          width: `${(step.visitors / prevStep.visitors) * 100}%`,
                          background: `repeating-linear-gradient(
                              45deg,
                              rgba(16, 185, 129, 0.25),
                              rgba(16, 185, 129, 0.25) 6px,
                              rgba(16, 185, 129, 0.15) 6px,
                              rgba(16, 185, 129, 0.15) 12px
                            )`,
                        }}
                      ></div>
                    )}
                    {/* Absolute conversion bar (from first step) */}
                    <div
                      className="h-full bg-emerald-500/70 rounded-md relative z-10"
                      style={{ width: `${barWidth}%` }}
                    ></div>
                    <div className="absolute top-2 right-2 z-20">
                      <div className="text-base font-semibold">{round(step.conversionRate, 2)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-neutral-400 text-sm">
            {isPending ? "Analyzing funnel..." : "Configure your funnel steps and click 'Analyze Funnel'"}
          </div>
        </div>
      )}
      <div className="flex justify-between items-center gap-2 ml-4">
        <div className="flex items-center gap-4 mt-3 text-xs text-neutral-400">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500/70 rounded-sm mr-1"></div>
            <span>Overall conversion</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-3 h-3 rounded-sm mr-1"
              style={{
                background: `repeating-linear-gradient(
                      45deg,
                      rgba(16, 185, 129, 0.25),
                      rgba(16, 185, 129, 0.25) 3px,
                      rgba(16, 185, 129, 0.15) 3px,
                      rgba(16, 185, 129, 0.15) 6px
                    )`,
              }}
            ></div>
            <span>Conversion from previous step</span>
          </div>
        </div>
      </div>
    </div>
  );
}
