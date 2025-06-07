"use client";
import { useGetSite } from "../../../api/admin/sites";
import { useSetPageTitle } from "../../../hooks/useSetPageTitle";
import { useStore } from "../../../lib/store";
import { SubHeader } from "../components/SubHeader/SubHeader";
import { MainSection } from "./components/MainSection/MainSection";
import { Countries } from "./components/sections/Countries";
import { Devices } from "./components/sections/Devices";
import { Events } from "./components/sections/Events";
import { Pages } from "./components/sections/Pages";
import { Referrers } from "./components/sections/Referrers";
import { Weekdays } from "./components/sections/Weekdays";

export default function MainPage() {
  const { site } = useStore();

  if (!site) {
    return null;
  }

  return <MainPageContent />;
}

function MainPageContent() {
  useSetPageTitle("Rybbit · Main");

  return (
    <div className="p-2 md:p-4 max-w-[1100px] mx-auto space-y-3 ">
      <SubHeader />
      <MainSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
        <Devices />
        <Pages />
        <Referrers />
        <Countries />
        <Events />
        <Weekdays />
      </div>
    </div>
  );
}
