import { ComparisonPage } from "../components/ComparisonPage";
import { fathomComparisonData } from "./comparison-data";
import { FathomComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Fathom Analytics',
  description: 'Compare Rybbit with Fathom Analytics. Discover the differences in features, pricing and approach.',
  openGraph: {
    title: 'Rybbit vs Fathom Analytics',
    description: 'Compare Rybbit with Fathom Analytics. Discover the differences in features, pricing and approach.',
    images: '/api/og?page=fathom',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Fathom Analytics',
    description: 'Compare Rybbit with Fathom Analytics. Discover the differences in features, pricing and approach.',
    images: '/api/og?page=fathom',
  },
};

export default function Fathom() {
  return (
    <ComparisonPage
      competitorName="Fathom"
      sections={fathomComparisonData}
      comparisonContent={<FathomComparisonContent />}
    />
  );
}