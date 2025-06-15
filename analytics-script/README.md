# Rybbit Analytics Script

A modern TypeScript-based analytics tracking script for Rybbit Analytics, featuring Web Vitals integration, comprehensive event tracking, and SPA support.

## Overview

This package modernizes the original JavaScript analytics script by:

- Converting to TypeScript with full type safety
- Bundling Web Vitals directly instead of using CDN
- Adding comprehensive unit test coverage
- Implementing a proper build pipeline with Vite

## Features

- **Page View Tracking**: Automatic and manual page view tracking
- **Custom Event Tracking**: Track user interactions and custom events
- **Outbound Link Tracking**: Monitor clicks to external websites
- **Web Vitals Collection**: Performance metrics (LCP, CLS, INP, FCP, TTFB)
- **SPA Support**: Single Page Application navigation tracking
- **User Identification**: Track users across sessions
- **Pattern-based URL Handling**: Skip or mask URLs based on patterns
- **Opt-out Support**: Privacy-compliant tracking disable options

## Build System

The package uses Vite for building and outputs to the `server/public/` directory:

- **Production Build**: `npm run build` → `script.js` (minified)
- **Development Build**: `npm run build:dev` → `script-full.js` (with source maps)

### Build Configuration

```javascript
// vite.config.ts
export default defineConfig(({ mode }) => ({
  build: {
    outDir: "../server/public",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "RybbitAnalytics",
      formats: ["iife"],
      fileName: mode === "development" ? "script-full" : "script",
    },
    minify: mode === "production",
    sourcemap: mode === "development",
  },
}));
```

## Project Structure

```
analytics-script/
├── src/
│   ├── index.ts          # Main analytics script entry point
│   ├── types.ts          # TypeScript interfaces and types
│   ├── utils.ts          # Utility functions
│   └── webVitals.ts      # Web Vitals collection class
├── tests/
│   ├── utils.test.ts     # Unit tests for utilities
│   ├── webVitals.test.ts # Unit tests for Web Vitals
│   └── index.test.ts     # Integration tests for main script
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
└── vitest.config.ts      # Vitest test configuration
```

## TypeScript Types

### Core Interfaces

```typescript
interface RybbitConfig {
  siteId: string;
  analyticsHost: string;
  debounceDuration: number;
  autoTrackPageview: boolean;
  autoTrackSpa: boolean;
  trackQuerystring: boolean;
  trackOutbound: boolean;
  enableWebVitals: boolean;
  skipPatterns: string[];
  maskPatterns: string[];
}

interface TrackingPayload {
  site_id: string;
  hostname: string;
  pathname: string;
  querystring: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  page_title: string;
  referrer: string;
  type: EventType;
  event_name?: string;
  properties?: string;
  user_id?: string;
}
```

## Testing

The package includes comprehensive test coverage using Vitest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

- **Utility Functions**: Pattern matching, debouncing, localStorage operations
- **Web Vitals Collection**: Metric collection, timeout handling, event batching
- **Main Script Integration**: API functionality, event handling, SPA tracking

## Usage

### Script Tag Integration

```html
<script
  src="https://analytics.yourdomain.com/script.js"
  data-site-id="123"
  data-debounce="500"
  data-auto-track-pageview="true"
  data-track-spa="true"
  data-track-query="true"
  data-track-outbound="true"
  data-skip-patterns='["/admin/*", "/api/*"]'
  data-mask-patterns='["/user/*"]'
></script>
```

### JavaScript API

```javascript
// Manual page view tracking
rybbit.pageview();

// Custom event tracking
rybbit.event("button_click", { category: "ui", action: "click" });

// Outbound link tracking
rybbit.trackOutbound("https://external.com", "External Link", "_blank");

// User identification
rybbit.identify("user123");
rybbit.getUserId(); // Returns current user ID
rybbit.clearUserId(); // Clears user ID

// Opt-out (before script loads)
window.__RYBBIT_OPTOUT__ = true;
```

## Web Vitals Integration

The script automatically collects Core Web Vitals metrics:

- **LCP (Largest Contentful Paint)**: Loading performance
- **CLS (Cumulative Layout Shift)**: Visual stability
- **INP (Interaction to Next Paint)**: Responsiveness
- **FCP (First Contentful Paint)**: Loading performance
- **TTFB (Time to First Byte)**: Server response time

Metrics are collected with a 20-second timeout and sent automatically when all metrics are available or on page unload.

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build for production
npm run build

# Build for development
npm run build:dev
```

### Integration with Server

The build process outputs directly to `../server/public/`, replacing the previous manual script management workflow. Update your server's build process to use:

```bash
cd analytics-script && npm run build
```

Instead of the previous `npm run pack-script` command.

## Migration from JavaScript

This TypeScript version maintains full compatibility with the original JavaScript implementation while adding:

1. **Type Safety**: Compile-time error checking and better IDE support
2. **Bundled Dependencies**: Web Vitals library bundled directly
3. **Modular Architecture**: Separated concerns for better maintainability
4. **Comprehensive Testing**: Unit and integration test coverage
5. **Modern Build Pipeline**: Vite-based build system with proper minification

## Performance

- **Production Bundle**: ~11.6 KB (4.35 KB gzipped)
- **Development Bundle**: ~20.4 KB (5.70 KB gzipped) with source maps
- **Web Vitals Library**: Bundled directly for reliability and performance
- **Zero External Dependencies**: All required code bundled in output

## Browser Support

- Modern browsers with ES2015+ support
- Graceful degradation for older browsers
- Web Vitals collection requires Performance Observer API support
