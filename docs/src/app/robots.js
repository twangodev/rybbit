export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_next/',
          '/api/',
          '/*.json$',
          '/_ignored/',
        ],
      },
    ],
    sitemap: 'https://rybbit.io/sitemap.xml',
    host: 'https://rybbit.io',
  };
}