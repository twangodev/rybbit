"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../../../../lib/utils";
import { Activity, AlertCircle, Plug2, Globe } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between">
      <div className="flex flex-col p-3">
        <div className="text-base text-neutral-100 mt-2 mb-4 mx-1 font-medium">Uptime</div>
        <SidebarLink
          label="Monitors"
          active={pathname.startsWith("/uptime/monitors")}
          href={"/uptime/monitors"}
          icon={<Activity className="w-4 h-4" />}
        />
        <SidebarLink
          label="Incidents"
          active={pathname.startsWith("/uptime/incidents")}
          href={"/uptime/incidents"}
          icon={<AlertCircle className="w-4 h-4" />}
        />
        <SidebarLink
          label="Notifications"
          active={pathname.startsWith("/uptime/notifications")}
          href={"/uptime/notifications"}
          icon={<Plug2 className="w-4 h-4" />}
        />
        <SidebarLink
          label="Status Page"
          active={pathname.startsWith("/uptime/status-page")}
          href={"/uptime/status-page"}
          icon={<Globe className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

// Sidebar Link component
function SidebarLink({
  label,
  active = false,
  href,
  icon,
}: {
  label: string;
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link href={href} className="focus:outline-none">
      <div
        className={cn(
          "px-3 py-2 rounded-lg transition-colors w-full",
          active ? "bg-neutral-800 text-white" : "text-neutral-200 hover:text-white hover:bg-neutral-800/50"
        )}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      </div>
    </Link>
  );
}
