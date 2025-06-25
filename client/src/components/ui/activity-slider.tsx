"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

interface ActivityPeriod {
  start: number;
  end: number;
}

interface ActivitySliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  activityPeriods?: ActivityPeriod[];
  duration?: number;
}

const ActivitySlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  ActivitySliderProps
>(({ className, activityPeriods = [], duration = 100, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-800">
      {/* Inactive background */}
      <div className="absolute h-full w-full bg-neutral-700" />
      
      {/* Activity periods */}
      {activityPeriods.map((period, index) => {
        const startPercent = duration > 0 ? (period.start / duration) * 100 : 0;
        const widthPercent = duration > 0 ? ((period.end - period.start) / duration) * 100 : 0;
        
        return (
          <div
            key={index}
            className="absolute h-full bg-neutral-600"
            style={{
              left: `${startPercent}%`,
              width: `${widthPercent}%`,
            }}
          />
        );
      })}
      
      {/* Progress range */}
      <SliderPrimitive.Range className="absolute h-full bg-green-500" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-green-500 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50 dark:border-green-500 dark:bg-white" />
  </SliderPrimitive.Root>
));
ActivitySlider.displayName = "ActivitySlider";

export { ActivitySlider };