import { ComparisonSection } from "../components/ComparisonPage";

export const simpleAnalyticsComparisonData: ComparisonSection[] = [
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
        name: "Source tracking",
        rybbitValue: true,
        competitorValue: true,
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
        tooltip: "Rybbit supports rich event attributes",
      },
      {
        name: "Conversion goals",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Geographic data",
        rybbitValue: "City-level",
        competitorValue: "Country-level",
        tooltip: "More detailed location tracking",
      },
      {
        name: "Auto-collect events",
        rybbitValue: true,
        competitorValue: true,
        tooltip: "Downloads, outbound links, etc.",
      },
      {
        name: "AI analytics assistant",
        rybbitValue: false,
        competitorValue: true,
        tooltip: "SimpleAnalytics has AI-powered insights",
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
        name: "Ecommerce analytics",
        rybbitValue: true,
        competitorValue: false,
      },
    ],
  },
  {
    title: "Privacy & Compliance",
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
        name: "CCPA compliant",
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
        name: "Data stored in EU",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Open Source & Transparency",
    features: [
      {
        name: "Open source",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "SimpleAnalytics is closed source",
      },
      {
        name: "Self-hostable",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Full control with self-hosting option",
      },
      {
        name: "GitHub stars",
        rybbitValue: "8000+",
        competitorValue: "N/A",
      },
      {
        name: "Open roadmap",
        rybbitValue: false,
        competitorValue: true,
        tooltip: "SimpleAnalytics has public roadmap",
      },
      {
        name: "Public metrics",
        rybbitValue: false,
        competitorValue: true,
        tooltip: "SimpleAnalytics shares revenue/costs publicly",
      },
      {
        name: "License",
        rybbitValue: "AGPL v3",
        competitorValue: "Proprietary",
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
        name: "Tweet reports",
        rybbitValue: false,
        competitorValue: true,
        tooltip: "Auto-tweet analytics",
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
    title: "Technical & Performance",
    features: [
      {
        name: "Script size",
        rybbitValue: "18KB",
        competitorValue: "~3KB",
        tooltip: "SimpleAnalytics is lighter, Rybbit includes more features",
      },
      {
        name: "Bot filtering",
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
        competitorValue: "Node.js/PostgreSQL",
      },
      {
        name: "Bypasses ad blockers",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Organization support",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Multi-organization management",
      },
    ],
  },
  {
    title: "Pricing & Support",
    features: [
      {
        name: "Free tier",
        rybbitValue: "10k events",
        competitorValue: "Unlimited views",
        tooltip: "SimpleAnalytics free tier has 30-day history limit",
      },
      {
        name: "Free tier limitations",
        rybbitValue: "Event limit",
        competitorValue: "30-day history",
        tooltip: "Data older than 30 days deleted on free tier",
      },
      {
        name: "Entry price",
        rybbitValue: "$19/mo",
        competitorValue: "$9/mo",
      },
      {
        name: "Free trial",
        rybbitValue: false,
        competitorValue: "14 days",
      },
      {
        name: "Data retention (paid)",
        rybbitValue: "2-5+ years",
        competitorValue: "Unlimited",
      },
      {
        name: "Payment options",
        rybbitValue: "Standard",
        competitorValue: "Crypto accepted",
        tooltip: "SimpleAnalytics accepts Bitcoin",
      },
      {
        name: "Customer support",
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