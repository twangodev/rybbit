import { ComparisonPage } from "../components/ComparisonPage";
import { plausibleComparisonData } from "./comparison-data";
import { PlausibleComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Plausible Analytics',
  description: 'Compare Rybbit with Plausible Analytics. Learn about features, pricing and technical differences.',
  openGraph: {
    title: 'Rybbit vs Plausible Analytics',
    description: 'Compare Rybbit with Plausible Analytics. Learn about features, pricing and technical differences.',
    images: '/compare-og/plausible/image.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Plausible Analytics',
    description: 'Compare Rybbit with Plausible Analytics. Learn about features, pricing and technical differences.',
    images: '/compare-og/plausible/image.png',
  },
};

export default function Plausible() {
  return (
    <ComparisonPage
      competitorName="Plausible"
      sections={plausibleComparisonData}
      comparisonContent={<PlausibleComparisonContent />}
    />
  );
}