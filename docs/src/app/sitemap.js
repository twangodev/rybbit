export default function sitemap() {
  const baseUrl = 'https://rybbit.io';
  
  // Static pages
  const staticPages = [
    '',
    '/pricing',
    '/contact',
    '/privacy',
    '/blog',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Documentation pages - you can expand this based on your docs structure
  const docPages = [
    '/docs',
    '/docs/self-hosting',
    '/docs/script',
    '/docs/track-events',
    '/docs/definitions',
    '/docs/guides/next-js',
    '/docs/guides/react',
    '/docs/guides/wordpress',
    '/docs/guides/shopify',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Blog posts would be dynamically generated in a real implementation
  // For now, adding the known blog posts
  const blogPosts = [
    '/blog/5k-stars',
    '/blog/website-traffic-drop',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...docPages, ...blogPosts];
}