import { ComparisonSection } from "../components/ComparisonPage";

export const cloudflareAnalyticsComparisonData: ComparisonSection[] = [
  {
    title: "Core Analytics Features",
    features: [
      {
        name: "Web analytics dashboard",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Real-time data",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Live visitors counter",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "See who's on your site right now",
      },
      {
        name: "Real-time globe view",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "3D visualization of live visitor activity",
      },
      {
        name: "Visit duration metrics",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "Bounce rate tracking",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "Entry/exit pages",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "UTM campaign tracking",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Track marketing campaigns effectively",
      },
      {
        name: "Custom events with attributes",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "Conversion goals",
        rybbitValue: true,
        competitorValue: false,
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
        tooltip: "Analyze conversion paths",
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
        name: "Web Vitals dashboard",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Error tracking",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Browser error monitoring",
      },
      {
        name: "Public dashboards",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Share your analytics publicly",
      },
    ],
  },
  {
    title: "Data & Accuracy",
    features: [
      {
        name: "Data sampling",
        rybbitValue: "No sampling",
        competitorValue: "10% sample",
        tooltip: "Cloudflare only analyzes 10% of your traffic",
      },
      {
        name: "Data retention",
        rybbitValue: "2-5+ years",
        competitorValue: "6 months",
        tooltip: "Keep your historical data much longer",
      },
      {
        name: "Unique visitor tracking",
        rybbitValue: "Accurate",
        competitorValue: "Overcounts",
        tooltip: "Cloudflare counts same visitor multiple times",
      },
      {
        name: "Bot filtering",
        rybbitValue: true,
        competitorValue: "Minimal",
        tooltip: "Better protection against bot traffic inflation",
      },
      {
        name: "Dashboard item limits",
        rybbitValue: "Unlimited",
        competitorValue: "Top 15 only",
        tooltip: "See all your data, not just top items",
      },
      {
        name: "Geolocation detail",
        rybbitValue: "City-level",
        competitorValue: "Country-level",
      },
    ],
  },
  {
    title: "Implementation & Setup",
    features: [
      {
        name: "One-line installation",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Cloudflare requires proxying through their CDN",
      },
      {
        name: "Works without CDN",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Cloudflare Analytics requires using their CDN",
      },
      {
        name: "Self-hostable",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Open source with self-hosting option",
      },
      {
        name: "Multiple domain tracking",
        rybbitValue: true,
        competitorValue: "Limited",
        tooltip: "Track unlimited websites",
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
        name: "Daily rotating salt option",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Enhanced privacy with automatic identifier rotation",
      },
      {
        name: "100% data ownership",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Your data never leaves your control",
      },
      {
        name: "Open source",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "AGPL v3 licensed with 8000+ GitHub stars",
      },
    ],
  },
  {
    title: "Support & Business Model",
    features: [
      {
        name: "Customer support",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Real human support, not just forums",
      },
      {
        name: "Dedicated product focus",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Analytics is our core business, not a side feature",
      },
      {
        name: "API access",
        rybbitValue: true,
        competitorValue: false,
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
        name: "Live demo available",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Try with real data before signing up",
      },
    ],
  },
];
