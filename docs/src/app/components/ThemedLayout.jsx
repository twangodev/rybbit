"use client";

import { usePathname } from "next/navigation";
import { Layout as NextraLayout } from "nextra-theme-docs";

export function ThemedLayout({ children, ...props }) {
  const pathname = usePathname();
  const isDocsPage = pathname.startsWith("/docs");

  const themeConfig = isDocsPage
    ? {
        defaultTheme: "system",
      }
    : {
        defaultTheme: "dark",
        forcedTheme: "dark",
      };

  return (
    <NextraLayout {...props} nextThemes={themeConfig}>
      {children}
    </NextraLayout>
  );
}