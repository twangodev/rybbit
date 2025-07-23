"use client";

import { useQueryClient } from "@tanstack/react-query";
import { BarChart, SquareActivity, User, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "../lib/auth";
import { IS_CLOUD } from "../lib/const";
import { cn } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Skeleton } from "./ui/skeleton";

const SettingsMenu = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <>
      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center text-xs font-medium p-1" variant="ghost" size="xs">
            <User className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
      ) : isPending ? (
        <Skeleton className="w-20 h-4 mr-2" />
      ) : (
        <SidebarLink
          href={
            typeof window !== "undefined" && globalThis.location.hostname === "demo.rybbit.io"
              ? "https://app.rybbit.io/signup"
              : "/signup"
          }
          icon={<UserPlus className="w-4 h-4" />}
        />
      )}
    </>
  );
};

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-between h-screen p-2 py-4 bg-neutral-900 border-r border-neutral-750 gap-3">
      <div className="flex flex-col items-center gap-2">
        <Link href="/">
          <Image src="/rybbit.svg" alt="Rybbit" width={24} height={24} className="mb-5" />
        </Link>
        <SidebarLink
          href="/"
          icon={<BarChart className="w-5 h-5" />}
          active={pathname === "/" || !isNaN(Number(pathname.split("/")[1]))}
        />
        <SidebarLink href="/uptime" icon={<SquareActivity className="w-5 h-5" />} active={pathname === "/uptime"} />
      </div>
      <div>
        <SettingsMenu />
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
          active ? "bg-neutral-750 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-750/80"
        )}
      >
        <div className="flex items-center gap-2">{icon}</div>
      </div>
    </Link>
  );
}
