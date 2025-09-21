import { ComparisonPage } from "../components/ComparisonPage";
import { cloudflareAnalyticsComparisonData } from "./comparison-data";
import { CloudflareAnalyticsComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Cloudflare Analytics',
  description: 'Compare Rybbit with Cloudflare Analytics. Learn about features, pricing and privacy differences.',
  openGraph: {
    title: 'Rybbit vs Cloudflare Analytics',
    description: 'Compare Rybbit with Cloudflare Analytics. Learn about features, pricing and privacy differences.',
    images: '/api/og?page=cloudflare-analytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Cloudflare Analytics',
    description: 'Compare Rybbit with Cloudflare Analytics. Learn about features, pricing and privacy differences.',
    images: '/api/og?page=cloudflare-analytics',
  },
};

export default function CloudflareAnalytics() {
  return (
    <ComparisonPage
      competitorName="Cloudflare Analytics"
      sections={cloudflareAnalyticsComparisonData}
      comparisonContent={<CloudflareAnalyticsComparisonContent />}
    />
  );
}