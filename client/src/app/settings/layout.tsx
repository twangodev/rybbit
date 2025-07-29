import { AppSidebar } from "../../components/AppSidebar";
import { Sidebar } from "./components/SIdebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <AppSidebar />
      <Sidebar />
      <div className="flex-1 overflow-auto mt-4">{children}</div>
    </div>
  );
}
