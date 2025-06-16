/* eslint-env node */
import { Tilt_Warp } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Layout, Navbar } from "nextra-theme-docs";
import "nextra-theme-docs/style.css";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { cn } from "../lib/utils";
import "./globals.css";
import { PostHogProvider } from "./providers";

const tilt_wrap = Tilt_Warp({
  subsets: ["latin"],
  weight: "400",
});

export const metadata = {
  metadataBase: new URL("https://rybbit.io"),
  title: {
    template: "%s - Rybbit",
    default: "Rybbit - The Modern Google Analytics Replacement",
  },
  description:
    "Next-gen, open source, lightweight, cookieless web & product analytics for everyone.",
  // description: 'Next-gen, open source, lightweight, cookieless web & product analytics for everyone — GDPR/CCPA compliant.',
  applicationName: "Rybbit",
  generator: "Next.js",
  alternates: {
    canonical: "https://rybbit.io",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://rybbit.io",
    siteName: "Rybbit",
    title: "Rybbit - The Modern Google Analytics Replacement",
    description:
      "Next-gen, open source, lightweight, cookieless web & product analytics for everyone.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Rybbit - The Modern Google Analytics Replacement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@rybbit_io",
    creator: "@rybbit_io",
    title: "Rybbit - The Modern Google Analytics Replacement",
    description:
      "Next-gen, open source, lightweight, cookieless web & product analytics for everyone.",
    images: ["/opengraph-image.png"],
  },
  appleWebApp: {
    title: "Rybbit",
  },
  other: {
    "msapplication-TileImage": "/ms-icon-144x144.png",
    "msapplication-TileColor": "#fff",
  },
};

function Footer_() {
  return (
    <div className="max-w-[1300px] mx-auto">
      <div className="flex flex-col md:flex-row items-center md:justify-between w-full px-6 py-4 space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 md:justify-between w-full">
          <Image src="/rybbit-text.svg" alt="Rybbit" width={120} height={27} />
          <div className="text-sm text-neutral-400 text-center md:text-left">
            Copyright {new Date().getFullYear()} © Rybbit.
          </div>
          <div className="flex gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// JSON-LD structured data for organization
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rybbit",
  description: "Open source, privacy-focused web analytics platform",
  url: "https://rybbit.io",
  logo: "https://rybbit.io/rybbit.svg",
  sameAs: ["https://github.com/rybbit-io/rybbit"],
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@rybbit.io",
    contactType: "customer support",
  },
};

// JSON-LD structured data for software application
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rybbit",
  applicationCategory: "Analytics",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    priceValidUntil: "2025-12-31",
  },
  description: "Open source web analytics platform that respects user privacy",
  softwareVersion: "1.0",
  url: "https://rybbit.io",
  author: {
    "@type": "Organization",
    name: "Rybbit",
  },
};

export default async function RootLayout({ children }) {
  const navbar = (
    <Navbar
      logo={
        <Image src="/rybbit-text.svg" alt="Rybbit" width={110} height={27} />
      }
      chatLink="https://discord.gg/DEhGb4hYBj"
      projectLink="https://github.com/rybbit-io/rybbit"
      children={
        <a href="https://app.rybbit.io">
          <button className="bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium px-3 py-1.5 rounded-md border border-neutral-600 transform hover:-translate-y-0.5 transition-all duration-200 hover:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-50 cursor-pointer">
            Login
          </button>
        </a>
      }
    />
  );
  const pageMap = await getPageMap();
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head
        color={{
          hue: 158,
          saturation: 64,
          lightness: 51,
        }}
      />
      {/* <script
        src="https://app.rybbit.io/api/script.js"
        site-id="2"
        defer
        data-enable-replay="true"
      /> */}
      <script
        src="https://demo.rybbit.io/api/script.js"
        data-site-id="21"
        defer
        data-enable-replay="true"
      ></script>
      <script
        src="https://amdtest.tomato.gg/api/script.js"
        data-site-id="2"
        defer
        data-enable-replay="true"
      ></script>
      <body>
        <PostHogProvider>
          <Layout
            banner={
              <div className="text-center text-sm text-neutral-100 pt-2 pb-1 bg-neutral-700/50 flex items-center justify-center gap-2">
                <div className="mb-1">
                  🚀 We just launched! Please star us on Github!{" "}
                </div>
                <a
                  className="github-button"
                  href="https://github.com/rybbit-io/rybbit"
                  data-color-scheme="no-preference: light; light: light; dark: light;"
                  data-show-count="true"
                  aria-label="Star rybbit-io/rybbit on GitHub"
                ></a>
              </div>
            }
            navbar={navbar}
            footer={<Footer_ />}
            editLink="Edit this page on GitHub"
            docsRepositoryBase="https://github.com/rybbit-io/rybbit/tree/master/docs"
            sidebar={{ defaultMenuCollapseLevel: 1 }}
            pageMap={pageMap}
            nextThemes={{
              defaultTheme: "dark",
              forcedTheme: "dark",
            }}
          >
            {children}
          </Layout>
          <script
            async
            defer
            src="https://buttons.github.io/buttons.js"
          ></script>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
          />
        </PostHogProvider>
      </body>
    </html>
  );
}
