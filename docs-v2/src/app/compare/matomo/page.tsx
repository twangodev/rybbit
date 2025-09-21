import { ComparisonPage } from "../components/ComparisonPage";
import { matomoComparisonData } from "./comparison-data";
import { MatomoComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs Matomo',
  description: 'Compare Rybbit with Matomo (Piwik). Learn about features, pricing and self-hosting options.',
  openGraph: {
    title: 'Rybbit vs Matomo',
    description: 'Compare Rybbit with Matomo (Piwik). Learn about features, pricing and self-hosting options.',
    images: '/api/og?page=matomo',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs Matomo',
    description: 'Compare Rybbit with Matomo (Piwik). Learn about features, pricing and self-hosting options.',
    images: '/api/og?page=matomo',
  },
};

export default function Matomo() {
  return (
    <ComparisonPage
      competitorName="Matomo"
      sections={matomoComparisonData}
      comparisonContent={<MatomoComparisonContent />}
    />
  );
}