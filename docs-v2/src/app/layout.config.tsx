import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <>
        <Image src="/rybbit-text.svg" alt="Rybbit" width={150} height={27} className="mr-2" />
      </>
    ),
  },
  // see https://fumadocs.dev/docs/ui/navigation/links
  links: [
    {
      text: "Pricing",
      url: "/pricing",
    },
    {
      text: "Demo",
      url: "https://demo.rybbit.io/21",
      external: true,
    },
    {
      text: "GitHub",
      url: "https://github.com/rybbit-io/rybbit",
      external: true,
    },
  ],
};
