import { ComparisonPage } from "../components/ComparisonPage";
import { simpleAnalyticsComparisonData } from "./comparison-data";
import { SimpleAnalyticsComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Simple Analytics',
  description: 'Compare Rybbit with Simple Analytics. See the differences in features, pricing and implementation.',
  openGraph: {
    title: 'Rybbit vs Simple Analytics',
    description: 'Compare Rybbit with Simple Analytics. See the differences in features, pricing and implementation.',
    images: '/compare-og/simpleanalytics/image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Simple Analytics',
    description: 'Compare Rybbit with Simple Analytics. See the differences in features, pricing and implementation.',
    images: '/compare-og/simpleanalytics/image.png',
  },
};

export default function SimpleAnalytics() {
  return (
    <ComparisonPage
      competitorName="SimpleAnalytics"
      sections={simpleAnalyticsComparisonData}
      comparisonContent={<SimpleAnalyticsComparisonContent />}
    />
  );
}