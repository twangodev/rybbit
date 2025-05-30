"use client";

import { SubHeader } from "../components/SubHeader/SubHeader";
import { PerformanceChart } from "./components/PerformanceChart";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { PerformanceTable } from "./components/PerformanceTable";

export default function PerformancePage() {
  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3 ">
      <SubHeader />

      <div className="space-y-6">
        <PerformanceOverview />
        <PerformanceChart />
        <PerformanceTable />
      </div>
    </div>
  );
}
