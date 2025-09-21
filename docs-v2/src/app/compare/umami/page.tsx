import { ComparisonPage } from "../components/ComparisonPage";
import { umamiComparisonData } from "./comparison-data";
import { UmamiComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Umami',
  description: 'Compare Rybbit with Umami Analytics. Discover differences in features, hosting options and pricing.',
  openGraph: {
    title: 'Rybbit vs Umami',
    description: 'Compare Rybbit with Umami Analytics. Discover differences in features, hosting options and pricing.',
    images: '/compare-og/umami/image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Umami',
    description: 'Compare Rybbit with Umami Analytics. Discover differences in features, hosting options and pricing.',
    images: '/compare-og/umami/image.png',
  },
};

export default function Umami() {
  return (
    <ComparisonPage
      competitorName="Umami"
      sections={umamiComparisonData}
      comparisonContent={<UmamiComparisonContent />}
    />
  );
}