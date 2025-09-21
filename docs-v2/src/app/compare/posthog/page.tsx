import { ComparisonPage } from "../components/ComparisonPage";
import { posthogComparisonData } from "./comparison-data";
import { PostHogComparisonContent } from "./ComparisonContent";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rybbit vs PostHog',
  description: 'Compare Rybbit with PostHog. Privacy-focused analytics vs product analytics platform.',
  openGraph: {
    title: 'Rybbit vs PostHog',
    description: 'Compare Rybbit with PostHog. Privacy-focused analytics vs product analytics platform.',
    images: '/api/og?page=posthog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rybbit vs PostHog',
    description: 'Compare Rybbit with PostHog. Privacy-focused analytics vs product analytics platform.',
    images: '/api/og?page=posthog',
  },
};

export default function PostHog() {
  return (
    <ComparisonPage
      competitorName="PostHog"
      sections={posthogComparisonData}
      comparisonContent={<PostHogComparisonContent />}
    />
  );
}