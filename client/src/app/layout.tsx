"use client";

import QueryProvider from "@/providers/QueryProvider";
import { Inter } from "next/font/google";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { userStore } from "../lib/userStore";
import { cn } from "../lib/utils";
import "./globals.css";
import Script from "next/script";
import { useStopImpersonation } from "@/hooks/useStopImpersonation";
import { ReactScan } from "./ReactScan";
import { OrganizationInitializer } from "../components/OrganizationInitializer";
import { useGetSiteIsPublic } from "@/api/admin/sites";

const inter = Inter({ subsets: ["latin"] });

const publicRoutes = ["/login", "/signup", "/invitation", "/reset-password"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isPending } = userStore();
  const pathname = usePathname();

  // Extract potential siteId from path like /{siteId} or /{siteId}/something
  const pathSegments = pathname.split("/").filter(Boolean);
  const potentialSiteId =
    pathSegments.length > 0 && !isNaN(Number(pathSegments[0]))
      ? pathSegments[0]
      : undefined;

  // Use Tanstack Query to check if site is public
  const { data: isPublicSite, isLoading: isCheckingPublic } =
    useGetSiteIsPublic(potentialSiteId);

  // Use the hook to expose stopImpersonating globally
  useStopImpersonation();

  useEffect(() => {
    // Only redirect if:
    // 1. We're not checking public status anymore
    // 2. User is not logged in
    // 3. Not on a public route
    // 4. Not on a public site
    if (
      !isPending &&
      !isCheckingPublic &&
      !user &&
      !publicRoutes.includes(pathname) &&
      !isPublicSite
    ) {
      redirect("/login");
    }
  }, [isPending, user, pathname, isCheckingPublic, isPublicSite]);

  return (
    <html lang="en" className="dark">
      <ReactScan />
      <TooltipProvider>
        <body
          className={cn(
            "bg-background text-foreground h-full",
            inter.className
          )}
        >
          <QueryProvider>
            <OrganizationInitializer />
            {children}
          </QueryProvider>
          <Toaster />
        </body>
      </TooltipProvider>
      {globalThis?.location?.hostname === "app.rybbit.io" && (
        <Script
          src="https://demo.rybbit.io/api/script.js"
          data-site-id="22"
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}
