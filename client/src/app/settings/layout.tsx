"use client";

import { useWindowSize } from "@uidotdev/usehooks";
import { AppSidebar } from "../../components/AppSidebar";
import { StandardPage } from "../../components/StandardPage";
import { MobileSidebar } from "./components/MobileSidebar";
import { Sidebar } from "./components/SIdebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { width } = useWindowSize();

  if (width && width < 768) {
    return (
      <StandardPage showSidebar={false}>
        <MobileSidebar />
        <div className="mt-4">{children}</div>
      </StandardPage>
    );
  }

  return (
    <div className="flex h-full">
      <AppSidebar />
      <Sidebar />
      <StandardPage showSidebar={false}>
        <div className="flex-1 overflow-auto mt-4">{children}</div>
      </StandardPage>
    </div>
  );
}
