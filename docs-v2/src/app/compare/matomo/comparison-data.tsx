import { ComparisonSection } from "../components/ComparisonPage";

export const matomoComparisonData: ComparisonSection[] = [
  {
    title: "Ease of Use",
    features: [
      {
        name: "Simple, intuitive interface",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo has 12+ sections with 70+ reports",
      },
      {
        name: "Single-page dashboard",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "All key metrics at a glance",
      },
      {
        name: "No training required",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo's complexity rivals Google Analytics",
      },
      {
        name: "One-click setup",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo requires extensive configuration",
      },
      {
        name: "Beautiful modern UI",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Clean, contemporary design vs dated interface",
      },
    ],
  },
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
        name: "Custom events tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Conversion goals",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Ecommerce tracking",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Heatmaps",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "A/B testing",
        rybbitValue: false,
        competitorValue: true,
      },
      {
        name: "Form analytics",
        rybbitValue: false,
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
        competitorValue: false,
        tooltip: "Visualize user flow patterns",
      },
      {
        name: "User profiles",
        rybbitValue: true,
        competitorValue: true,
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
        name: "Public dashboards",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Share your analytics publicly",
      },
    ],
  },
  {
    title: "Performance & Infrastructure",
    features: [
      {
        name: "Script size",
        rybbitValue: "18KB",
        competitorValue: "20-50KB",
        tooltip: "Lighter weight tracking script",
      },
      {
        name: "Global CDN included",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo requires custom CDN setup",
      },
      {
        name: "Modern tech stack",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Next.js, TypeScript, ClickHouse vs PHP/MySQL",
      },
      {
        name: "Auto-scaling cloud",
        rybbitValue: true,
        competitorValue: "Self-host only",
        tooltip: "Matomo cloud is limited and expensive",
      },
      {
        name: "Zero maintenance",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo requires regular updates and maintenance",
      },
    ],
  },
  {
    title: "Privacy & Compliance",
    features: [
      {
        name: "Cookie-free tracking",
        rybbitValue: true,
        competitorValue: "Optional",
        tooltip: "Matomo uses cookies by default",
      },
      {
        name: "GDPR compliant by default",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo needs configuration for compliance",
      },
      {
        name: "No consent banner needed",
        rybbitValue: true,
        competitorValue: false,
        tooltip: "Matomo often requires consent notices",
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
        competitorValue: "Varies",
        tooltip: "Depends on hosting location",
      },
    ],
  },
  {
    title: "Data & Hosting",
    features: [
      {
        name: "Data retention",
        rybbitValue: "2-5+ years",
        competitorValue: "24 months (cloud)",
        tooltip: "Keep your historical data longer",
      },
      {
        name: "Self-hostable",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Managed cloud option",
        rybbitValue: true,
        competitorValue: "Limited",
        tooltip: "Matomo cloud has restrictions",
      },
      {
        name: "Easy Google Analytics import",
        rybbitValue: false,
        competitorValue: "Complex",
        tooltip: "Matomo requires API key generation",
      },
      {
        name: "Data export",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "API access",
        rybbitValue: true,
        competitorValue: true,
      },
    ],
  },
  {
    title: "Support & Pricing",
    features: [
      {
        name: "Human customer support",
        rybbitValue: true,
        competitorValue: "Paid only",
        tooltip: "Real support included in all plans",
      },
      {
        name: "Free tier",
        rybbitValue: "10k events",
        competitorValue: "Self-host only",
      },
      {
        name: "Cloud pricing",
        rybbitValue: "$19-$499/mo",
        competitorValue: "€19-€450+/mo",
        tooltip: "More affordable cloud pricing",
      },
      {
        name: "Open source",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Live demo available",
        rybbitValue: true,
        competitorValue: true,
      },
      {
        name: "Documentation quality",
        rybbitValue: "Modern",
        competitorValue: "Extensive but complex",
      },
    ],
  },
];