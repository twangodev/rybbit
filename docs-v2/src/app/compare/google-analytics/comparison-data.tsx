import { ComparisonSection } from "../components/ComparisonPage";

export const googleAnalyticsComparisonData: ComparisonSection[] = [
  {
    title: "Privacy & Compliance",
    features: [
      {
        name: "GDPR compliant without cookie banner",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "No cookies means no consent banners needed",
      },
      {
        name: "CCPA compliant",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "No personal data collection",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "We never track personally identifiable information",
      },
      {
        name: "Cookie-free tracking",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "100% data ownership",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Your data is never shared or used for advertising",
      },
    ],
  },
  {
    title: "Performance & Accuracy",
    features: [
      {
        name: "Script size",
        rybbitValue: "<1KB",
        competitorValue: "~45KB",
        tooltip: "45x smaller than Google Analytics",
      },
      {
        name: "Real-time data",
        rybbitValue: true,
        competitorValue: "24-48h delay",
        tooltip: "See visitor activity as it happens",
      },
      {
        name: "No data sampling",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Google Analytics samples data on high-traffic sites",
      },
      {
        name: "Bot filtering",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Bypasses ad blockers",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Get accurate data from all visitors",
      },
      {
        name: "Data retention",
        rybbitValue: "Forever",
        competitorValue: "2-14 months",
        tooltip: "Never lose your historical data",
      },
    ],
  },
  {
    title: "Features & Usability",
    features: [
      {
        name: "Session Replay",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Watch how users interact with your site",
      },
      {
        name: "Simple, intuitive dashboard",
        rybbitValue: true,
        competitorValue: false,
      },
      {
        name: "No training required",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Anyone on your team can use it immediately",
      },
      {
        name: "Email reports",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Custom events",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Conversion tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Public dashboards",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Share your stats publicly if you choose",
      },
    ],
  },
  {
    title: "Support & Pricing",
    features: [
      {
        name: "Human customer support",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Real people, not chatbots",
      },
      {
        name: "Transparent pricing",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Free tier (10k events/month)",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "No hidden costs",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Open source",
        rybbitValue: false,
        competitorValue: false,
      },
    ],
  },
];