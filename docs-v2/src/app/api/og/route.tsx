import { generateOGImage } from 'fumadocs-ui/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const comparisonPages: Record<string, { title: string; description: string }> = {
  'google-analytics': {
    title: 'Rybbit vs Google Analytics',
    description: 'Privacy-first analytics alternative to Google Analytics. See why developers choose Rybbit over GA4.',
  },
  'cloudflare-analytics': {
    title: 'Rybbit vs Cloudflare Analytics',
    description: 'Compare Rybbit with Cloudflare Analytics. Learn about features, pricing and privacy differences.',
  },
  'fathom': {
    title: 'Rybbit vs Fathom Analytics',
    description: 'Compare Rybbit with Fathom Analytics. Discover the differences in features, pricing and approach.',
  },
  'plausible': {
    title: 'Rybbit vs Plausible Analytics',
    description: 'Compare Rybbit with Plausible Analytics. Learn about features, pricing and technical differences.',
  },
  'simpleanalytics': {
    title: 'Rybbit vs Simple Analytics',
    description: 'Compare Rybbit with Simple Analytics. See the differences in features, pricing and implementation.',
  },
  'posthog': {
    title: 'Rybbit vs PostHog',
    description: 'Compare Rybbit with PostHog. Privacy-focused analytics vs product analytics platform.',
  },
  'umami': {
    title: 'Rybbit vs Umami',
    description: 'Compare Rybbit with Umami Analytics. Discover differences in features, hosting options and pricing.',
  },
  'matomo': {
    title: 'Rybbit vs Matomo',
    description: 'Compare Rybbit with Matomo (Piwik). Learn about features, pricing and self-hosting options.',
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = searchParams.get('page');

  if (!page || !comparisonPages[page]) {
    // Return a default OG image
    return generateOGImage({
      title: 'Rybbit Analytics',
      description: 'Privacy-first web analytics platform',
      site: 'Rybbit',
    });
  }

  const pageData = comparisonPages[page];

  return generateOGImage({
    title: pageData.title,
    description: pageData.description,
    site: 'Rybbit Analytics',
  });
}