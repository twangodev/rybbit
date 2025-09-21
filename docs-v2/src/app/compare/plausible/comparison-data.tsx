import { ComparisonSection } from "../components/ComparisonPage";

export const plausibleComparisonData: ComparisonSection[] = [
  {
    title: "Core Analytics Features",
    features: [
      {
        name: "Simple dashboard",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "Both offer clean, intuitive dashboards",
      },
      {
        name: "Real-time data",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Visitor analytics",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Page analytics",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Source tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Device/OS/Browser stats",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Geographic data",
        rybbitValue: "City-level",
        competitorValue: "Country-level",
        tooltip: "More detailed location data",
      },
      {
        name: "UTM tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Custom events",
        rybbitValue: "With attributes",
        competitorValue: "Basic",
        tooltip: "Rybbit supports event attributes for richer data",
      },
      {
        name: "Conversion goals",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      {
        name: "Session Replay",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Watch how users interact with your site",
      },
      {
        name: "Funnels",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Analyze multi-step conversion paths",
      },
      {
        name: "User journeys (Sankey)",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Visualize user flow patterns",
      },
      {
        name: "User profiles",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Detailed profiles with session history",
      },
      {
        name: "Sessions tracking",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "View all sessions with pageviews and events",
      },
      {
        name: "Real-time globe view",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "3D visualization of live visitor activity",
      },
      {
        name: "Web Vitals dashboard",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Core Web Vitals by page and region",
      },
      {
        name: "Error tracking",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Browser error monitoring",
      },
      {
        name: "Ecommerce tracking",
        rybbitValue: true,
        competitorValue: "Limited",
        tooltip: "Full ecommerce analytics support",
      },
    ],
  },
  {
    title: "Privacy & Open Source",
    features: [
      {
        name: "Cookie-free tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "GDPR compliant",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "No personal data collection",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Daily rotating salt option",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Enhanced privacy with automatic identifier rotation",
      },
      {
        name: "Open source",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Self-hostable",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "User Experience",
    features: [
      {
        name: "Beautiful UI",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "Both have clean, modern interfaces",
      },
      {
        name: "No training required",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Public dashboards",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Email reports",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Slack/Discord integration",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Live demo",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Dark mode",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Performance & Technical",
    features: [
      {
        name: "Script size",
        rybbitValue: "18KB",
        competitorValue: "<1KB",
        tooltip: "Plausible is lighter, Rybbit includes more features",
      },
      {
        name: "Real-time updates",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "API access",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Data export",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Tech stack",
        rybbitValue: "Next.js/ClickHouse",
        competitorValue: "Elixir/ClickHouse",
      },
      {
        name: "Bot filtering",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Bypasses ad blockers",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Data & Infrastructure",
    features: [
      {
        name: "Data retention",
        rybbitValue: "2-5+ years",
        competitorValue: "Unlimited",
      },
      {
        name: "Data location",
        rybbitValue: "EU (Hetzner)",
        competitorValue: "EU (Hetzner)",
      },
      {
        name: "Uptime SLA",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Team collaboration",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Organization support",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Multi-organization management",
      },
      {
        name: "Multiple websites",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Pricing & Support",
    features: [
      {
        name: "Free tier",
        rybbitValue: "10k events",
        competitorValue: false,
        tooltip: "Plausible has no free tier",
      },
      {
        name: "Entry price",
        rybbitValue: "$19/mo",
        competitorValue: "$9/mo",
      },
      {
        name: "Pricing model",
        rybbitValue: "Events-based",
        competitorValue: "Pageview-based",
      },
      {
        name: "Customer support",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Documentation",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Company type",
        rybbitValue: "Bootstrapped",
        competitorValue: "Bootstrapped",
      },
    ],
  },
];
