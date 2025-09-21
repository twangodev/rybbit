import { ComparisonSection } from "../components/ComparisonPage";

export const posthogComparisonData: ComparisonSection[] = [
  {
    title: "Core Analytics Features",
    features: [
      {
        name: "Web analytics",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Product analytics",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "Both offer event-based product analytics",
      },
      {
        name: "Simple dashboard",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog's interface is complex and developer-focused",
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
        competitorValue: "City-level",
      },
      {
        name: "UTM tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Custom events",
        rybbitValue: "With attributes",
        competitorValue: "With properties",
        tooltip: "Both support rich event data",
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
        competitorValue: true,
      },
      {
        name: "Funnels",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "User journeys (Sankey)",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "PostHog calls them Paths",
      },
      {
        name: "User profiles",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Sessions tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Real-time globe view",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Beautiful 3D visualization unique to Rybbit",
      },
      {
        name: "Web Vitals dashboard",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Error tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Heatmaps",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Feature flags",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "A/B testing",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Surveys",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "SQL query interface",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Cohort analysis",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Retention analysis",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Ecommerce tracking",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Privacy & Open Source",
    features: [
      {
        name: "Cookie-free tracking",
        rybbitValue: true,
        competitorValue: "Optional",
        tooltip: "PostHog uses cookies by default but can be configured",
      },
      {
        name: "GDPR compliant",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "No personal data collection",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog collects user profiles with PII",
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
      {
        name: "Privacy-first by default",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog requires configuration for privacy",
      },
    ],
  },
  {
    title: "User Experience",
    features: [
      {
        name: "Beautiful UI",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog has a functional but complex interface",
      },
      {
        name: "No training required",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog has a steep learning curve",
      },
      {
        name: "Non-technical friendly",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog is built for developers",
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
      {
        name: "Mobile app",
        rybbitValue: false,
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
        competitorValue: "~60KB",
        tooltip: "PostHog's script is heavier due to more features",
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
        competitorValue: "Django/ClickHouse",
      },
      {
        name: "Bot filtering",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Bypasses ad blockers",
        rybbitValue: true,
        competitorValue: "With proxy",
        tooltip: "PostHog requires reverse proxy setup",
      },
      {
        name: "Autocapture",
        rybbitValue: false,
        competitorValue: true,
        tooltip: "Automatically captures all interactions",
      },
    ],
  },
  {
    title: "Data & Infrastructure",
    features: [
      {
        name: "Data retention",
        rybbitValue: "2-5+ years",
        competitorValue: "7 years",
        tooltip: "PostHog offers longer retention on paid plans",
      },
      {
        name: "Data location",
        rybbitValue: "EU (Hetzner)",
        competitorValue: "US/EU",
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
        competitorValue: true,
      },
      {
        name: "Multiple websites",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "PostHog calls them projects",
      },
      {
        name: "Data residency options",
        rybbitValue: false,
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
        competitorValue: "1M events",
        tooltip: "PostHog has a very generous free tier",
      },
      {
        name: "Entry price",
        rybbitValue: "$19/mo",
        competitorValue: "$0/mo",
        tooltip: "PostHog's free tier covers most small projects",
      },
      {
        name: "Pricing model",
        rybbitValue: "Events-based",
        competitorValue: "Usage-based",
        tooltip: "PostHog charges per product per usage",
      },
      {
        name: "Predictable pricing",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "PostHog's multi-product pricing can be complex",
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
        name: "Community",
        rybbitValue: "Growing",
        competitorValue: "Large",
      },
      {
        name: "Company type",
        rybbitValue: "Bootstrapped",
        competitorValue: "VC-funded",
        tooltip: "PostHog raised $27M+",
      },
    ],
  },
];