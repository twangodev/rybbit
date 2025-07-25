import { AppSidebar } from "../../components/AppSidebar";
import { Sidebar } from "./monitors/components/Sidebar";

export default function UptimeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
