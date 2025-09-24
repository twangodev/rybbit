"use client";

import QueryProvider from "@/providers/QueryProvider";
import { Inter } from "next/font/google";
import { Toaster } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { cn } from "../lib/utils";
import "./globals.css";
import Script from "next/script";
import { useStopImpersonation } from "@/hooks/useStopImpersonation";
import { ReactScan } from "./ReactScan";
import { OrganizationInitializer } from "../components/OrganizationInitializer";
import { AuthenticationGuard } from "../components/AuthenticationGuard";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use the hook to expose stopImpersonating globally
  useStopImpersonation();

  return (
    <html lang="en" className="dark">
      {globalThis?.location?.hostname === "demo.rybbit.io" && (
        <head>
          <Script id="gtm-script" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KWZ8K6K9');`}
          </Script>
        </head>
      )}
      <ReactScan />
      <TooltipProvider>
        <body className={cn("bg-background text-foreground h-full", inter.className)}>
          {globalThis?.location?.hostname === "demo.rybbit.io" && (
            <noscript>
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-KWZ8K6K9"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              />
            </noscript>
          )}
          <QueryProvider>
            <OrganizationInitializer />
            <AuthenticationGuard />
            {children}
          </QueryProvider>
          <Toaster />
        </body>
      </TooltipProvider>
      {globalThis?.location?.hostname === "app.rybbit.io" && (
        <>
          <Script
            src="https://demo.rybbit.io/api/script.js"
            data-site-id="22"
            strategy="afterInteractive"
            data-web-vitals="true"
            data-track-errors="true"
            data-session-replay="true"
          />
        </>
      )}
    </html>
  );
}
