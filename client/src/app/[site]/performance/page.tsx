"use client";

import { SubHeader } from "../components/SubHeader/SubHeader";
import { PerformanceChart } from "./components/PerformanceChart";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { PerformanceByDimensions } from "./components/PerformanceByDimensions";

export default function PerformancePage() {
  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3 ">
      <SubHeader />

      <div className="space-y-4">
        <PerformanceOverview />
        <PerformanceChart />
        <PerformanceByDimensions />
      </div>
    </div>
  );
}
