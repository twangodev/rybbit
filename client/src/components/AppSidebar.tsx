"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BarChart, SquareActivity, User, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "../lib/auth";
import { IS_CLOUD } from "../lib/const";
import { cn } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const SettingsMenu = ({ expanded }: { expanded?: boolean }) => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center text-xs font-medium rounded-md transition-all duration-200 w-full",
              "text-neutral-400 hover:text-white hover:bg-neutral-750/80",
              expanded ? "p-2 gap-3 justify-start" : "p-2 justify-center"
            )}
            variant="ghost"
          >
            <User className="w-5 h-5 flex-shrink-0" />
            {expanded && <span className="text-sm font-medium whitespace-nowrap overflow-hidden">Account</span>}
          </DropdownMenuTrigger>
          <DropdownMenuContent align={expanded ? "start" : "end"} side="right">
            <Link href="/account" passHref>
              <DropdownMenuItem>Account</DropdownMenuItem>
            </Link>
            <Link href="/organization/members" passHref>
              <DropdownMenuItem>Organization</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={async () => {
                // Clear the query cache before signing out
                queryClient.clear();
                await authClient.signOut();
                router.push("/login");
              }}
            >
              Sign out
            </DropdownMenuItem>
            {session?.user.role === "admin" && IS_CLOUD && (
              <Link href="/admin" passHref>
                <DropdownMenuItem>Admin</DropdownMenuItem>
              </Link>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : isPending ? null : (
        <SidebarLink
          href={
            typeof window !== "undefined" && globalThis.location.hostname === "demo.rybbit.io"
              ? "https://app.rybbit.io/signup"
              : "/signup"
          }
          icon={<UserPlus className="w-5 h-5" />}
          label="Sign up"
          expanded={expanded}
        />
      )}
    </>
  );
};

export function AppSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!IS_CLOUD) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between h-screen p-2 py-3 bg-neutral-900 border-r border-neutral-800 gap-3 transition-all duration-1s00",
        isExpanded ? "w-44" : "w-[45px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col items-start gap-2">
        <Link href="/" className="mb-3 mt-1 ml-0.5 flex items-center justify-center">
          <Image src="/rybbit.svg" alt="Rybbit" width={24} height={18} />
        </Link>
        <SidebarLink
          href="/"
          icon={<BarChart className="w-5 h-5" />}
          label="Analytics"
          active={pathname === "/" || !isNaN(Number(pathname.split("/")[1]))}
          expanded={isExpanded}
        />
        <SidebarLink
          href="/uptime/monitors"
          icon={<SquareActivity className="w-5 h-5" />}
          label="Uptime"
          active={pathname.startsWith("/uptime")}
          expanded={isExpanded}
        />
      </div>
      <SettingsMenu expanded={isExpanded} />
    </div>
  );
}

function SidebarLink({
  active = false,
  href,
  icon,
  label,
  expanded = false,
}: {
  active?: boolean;
  href: string;
  icon?: React.ReactNode;
  label?: string;
  expanded?: boolean;
}) {
  return (
    <Link href={href} className="focus:outline-none">
      <div
        className={cn(
          "p-1 rounded-md transition-all duration-200 flex items-center gap-2",
          active ? "bg-neutral-750 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-750/80"
          // expanded ? "w-40" : "w-12"
        )}
      >
        <div className="flex items-center justify-center w-5 h-5 flex-shrink-0">{icon}</div>
        {expanded && label && (
          <span className="text-sm font-medium whitespace-nowrap overflow-hidden w-[120px]">{label}</span>
        )}
      </div>
    </Link>
  );
}
