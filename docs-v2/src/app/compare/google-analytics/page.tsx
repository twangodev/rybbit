import { ComparisonPage } from "../components/ComparisonPage";
import { googleAnalyticsComparisonData } from "./comparison-data";
import { GoogleAnalyticsComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Google Analytics',
  description: 'Privacy-first analytics alternative to Google Analytics. See why developers choose Rybbit over GA4.',
  openGraph: {
    title: 'Rybbit vs Google Analytics',
    description: 'Privacy-first analytics alternative to Google Analytics. See why developers choose Rybbit over GA4.',
    images: '/compare-og/google-analytics/image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Google Analytics',
    description: 'Privacy-first analytics alternative to Google Analytics. See why developers choose Rybbit over GA4.',
    images: '/compare-og/google-analytics/image.png',
  },
};

export default function GoogleAnalytics() {
  return (
    <ComparisonPage
      competitorName="Google Analytics"
      sections={googleAnalyticsComparisonData}
      comparisonContent={<GoogleAnalyticsComparisonContent />}
    />
  );
}
