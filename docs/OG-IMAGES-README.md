# OpenGraph Images for Twitter & Discord

This documentation explains the OpenGraph (OG) image setup for your Rybbit docs app, which will work perfectly with both Twitter and Discord sharing.

## 🎯 What We've Implemented

### 1. Dynamic OG Images for Docs Pages

- **Location**: `src/app/docs/[[...mdxPath]]/opengraph-image.jsx`
- **URL Pattern**: `https://your-domain.com/docs/[page-name]/opengraph-image`
- **Features**:
  - Automatically extracts page title and description from MDX metadata
  - Responsive font sizing based on title length
  - Consistent branding with Rybbit green theme
  - Beautiful dark theme with subtle patterns
  - Docs-specific branding (📚 docs.rybbit.io)

### 2. Dynamic Twitter Images for Docs Pages

- **Location**: `src/app/docs/[[...mdxPath]]/twitter-image.jsx`
- **URL Pattern**: `https://your-domain.com/docs/[page-name]/twitter-image`
- **Features**:
  - Same dynamic content as OG images
  - Twitter-specific branding (🐦 @rybbit_io)
  - Optimized for Twitter's card format

### 3. Global OG Images for Main App

- **Location**: `src/app/opengraph-image.jsx` & `src/app/twitter-image.jsx`
- **URL Pattern**: `https://your-domain.com/opengraph-image` & `https://your-domain.com/twitter-image`
- **Features**:
  - General Rybbit branding
  - Key features highlighted (Open Source, Cookieless, GDPR Compliant)
  - Professional presentation

## 🔧 Technical Details

### Image Specifications

- **Size**: 1200×630 pixels (perfect for both Twitter and Discord)
- **Format**: PNG
- **Runtime**: Edge runtime for fast generation
- **Font**: Inter (loaded from Google Fonts)

### Metadata Configuration

Enhanced the main layout (`src/app/layout.jsx`) with comprehensive OpenGraph and Twitter metadata:

```javascript
openGraph: {
  type: "website",
  locale: "en_US",
  url: "https://rybbit.io",
  siteName: "Rybbit",
  title: "Rybbit - Next-gen Web Analytics",
  description: "Open source, lightweight, cookieless web & product analytics for everyone — GDPR/CCPA compliant.",
  images: ["/opengraph-image"],
},
twitter: {
  card: "summary_large_image",
  site: "@rybbit_io",
  creator: "@rybbit_io",
  title: "Rybbit - Next-gen Web Analytics",
  description: "Open source, lightweight, cookieless web & product analytics for everyone — GDPR/CCPA compliant.",
  images: ["/opengraph-image"],
}
```

## 🧪 Testing

### Local Testing

1. Start the development server: `npm run dev`
2. Open `test-og.html` in your browser
3. Test these endpoints:
   - Main OG: `http://localhost:3003/opengraph-image`
   - Main Twitter: `http://localhost:3003/twitter-image`
   - Docs OG: `http://localhost:3003/docs/opengraph-image`
   - Specific doc: `http://localhost:3003/docs/track-events/opengraph-image`

### Production Testing

Use these tools to verify your OG images work correctly:

- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Discord**: Simply paste your URL in a Discord channel

## 🎨 Design Features

### Visual Elements

- **Dark Theme**: Matches your site's dark theme
- **Brand Colors**: Rybbit green (#22c55e) for accents
- **Typography**: Inter font for consistency
- **Patterns**: Subtle dot patterns for visual interest
- **Gradients**: Soft gradient overlays for depth
- **Responsive Text**: Automatically adjusts font size for long titles

### Platform-Specific Branding

- **Docs OG Images**: Show "📚 docs.rybbit.io"
- **Twitter Images**: Show "🐦 @rybbit_io"
- **Main App Images**: Show "🚀 rybbit.io"

## 🚀 How It Works

### For Docs Pages

1. When someone shares a docs URL (e.g., `/docs/track-events`)
2. Next.js automatically generates an OG image at `/docs/track-events/opengraph-image`
3. The image generator reads the MDX file metadata
4. It creates a beautiful, branded image with the page title and description
5. Social platforms use this image when displaying the link

### For Main App Pages

1. Non-docs pages use the global OG image
2. Shows general Rybbit branding and features
3. Consistent across all main app routes

## 📝 Customization

### Adding New Content

The OG images automatically work for new docs pages. Just ensure your MDX files have proper metadata:

```mdx
---
title: "Your Page Title"
description: "Your page description"
---
```

### Styling Changes

To modify the OG image design:

1. Edit the appropriate `opengraph-image.jsx` or `twitter-image.jsx` file
2. Modify the JSX-style inline styles
3. The images will regenerate automatically

### Brand Colors

Current colors used:

- **Background**: `#0a0a0a` (near black)
- **Primary**: `#22c55e` (Rybbit green)
- **Text**: `#ffffff` (white) and `#a3a3a3` (gray)
- **Accents**: Various transparency levels of the primary colors

## ✅ Platform Compatibility

### Twitter

- ✅ Large image cards (`summary_large_image`)
- ✅ Proper image sizing (1200×630)
- ✅ Twitter-specific metadata
- ✅ @rybbit_io branding

### Discord

- ✅ Rich embeds with large images
- ✅ Automatic title and description extraction
- ✅ High-quality image display
- ✅ Consistent branding

### Facebook/LinkedIn

- ✅ Standard OpenGraph protocol
- ✅ Proper image dimensions
- ✅ Rich link previews

## 🔍 Troubleshooting

### Images Not Showing

1. Check that the development server is running
2. Verify the image endpoints return PNG data
3. Check browser console for any errors
4. Ensure metadata is properly configured

### Cache Issues

- Social platforms cache OG images aggressively
- Use the platform-specific debugger tools to refresh cache
- For local testing, add a query parameter: `?v=1`

### Font Loading Issues

- Images use Google Fonts CDN
- Falls back gracefully if fonts don't load
- Edge runtime handles font caching automatically

## 🎉 Benefits

### For Users

- **Professional Appearance**: Beautiful, branded images when sharing
- **Consistent Experience**: Same visual identity across all platforms
- **Information Rich**: Title and description clearly visible
- **Platform Optimized**: Perfect for Twitter, Discord, Facebook, etc.

### For Your Brand

- **Increased Engagement**: Rich previews get more clicks
- **Brand Recognition**: Consistent Rybbit branding across shares
- **Professional Image**: High-quality, designed social media presence
- **SEO Benefits**: Better social signals and engagement

Your OG images are now ready! When you share any link from your docs site, it will show beautiful, branded images on Twitter, Discord, and other social platforms. 🎯
