"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, CreditCard, UserCircle } from "lucide-react";
import { cn } from "../../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between">
      <div className="flex flex-col p-3">
        <div className="text-base text-neutral-100 mt-2 mb-4 mx-1 font-medium">Settings</div>
        <SidebarLink
          label="Account"
          active={pathname.startsWith("/settings/account")}
          href={"/settings/account"}
          icon={<UserCircle className="w-4 h-4" />}
        />
        <SidebarLink
          label="Organization"
          active={pathname.startsWith("/settings/organization/members")}
          href={"/settings/organization"}
          icon={<Building2 className="w-4 h-4" />}
        />
        <SidebarLink
          label="Subscription"
          active={pathname.startsWith("/settings/organization/subscription")}
          href={"/settings/organization/subscription"}
          icon={<CreditCard className="w-4 h-4" />}
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
