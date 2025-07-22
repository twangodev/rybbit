"use client";

import { BarChart, Settings, SquareActivity } from "lucide-react";
import Image from "next/image";
import { cn } from "../lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-between h-screen p-2 py-4 bg-neutral-900 border-r border-neutral-750 gap-3">
      <div className="flex flex-col items-center gap-2">
        <Image src="/rybbit.svg" alt="Rybbit" width={24} height={24} className="mb-5" />
        <SidebarLink
          href="/"
          icon={<BarChart className="w-5 h-5" />}
          active={pathname === "/" || !isNaN(Number(pathname.split("/")[1]))}
        />
        <SidebarLink href="/uptime" icon={<SquareActivity className="w-5 h-5" />} active={pathname === "/uptime"} />
      </div>
      <div>
        <SidebarLink href="/settings" icon={<Settings className="w-5 h-5" />} />
      </div>
    </div>
  );
}

function SidebarLink({ active = false, href, icon }: { active?: boolean; href: string; icon?: React.ReactNode }) {
  return (
    <Link href={href} className="focus:outline-none">
      <div
        className={cn(
          "p-1 rounded-md transition-colors w-full",
          active ? "bg-neutral-800 text-white" : "text-neutral-200 hover:text-white hover:bg-neutral-800/50"
        )}
      >
        <div className="flex items-center gap-2">{icon}</div>
      </div>
    </Link>
  );
}
