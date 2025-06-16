"use client";

import { SubHeader } from "../components/SubHeader/SubHeader";
import { PerformanceChart } from "./components/PerformanceChart";
import { PerformanceOverview } from "./components/PerformanceOverview";
import { PerformanceByDimensions } from "./components/PerformanceByDimensions";
import { EnableWebVitals } from "./components/EnableWebVitals";
import { DisabledOverlay } from "../../../components/DisabledOverlay";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";

export default function PerformancePage() {
  useSetPageTitle("Rybbit · Performance");
  return (
    <DisabledOverlay message="Performance">
      <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3 ">
        <SubHeader />
        <EnableWebVitals />
        <div className="space-y-4">
          <PerformanceOverview />
          <PerformanceChart />
          <PerformanceByDimensions />
        </div>
      </div>
    </DisabledOverlay>
  );
}
