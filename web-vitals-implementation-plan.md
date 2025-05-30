# Web Vitals Implementation Plan

## Final Architecture Decision

- **Storage**: Same events table with new `web_vital` event type
- **Columns**: Dedicated columns for each web vitals metric
- **Approach**: Separate events for pageview and web vitals with correlation

## Web Vitals Metrics to Include

### Core Web Vitals (Google's Official Metrics)

1. **LCP (Largest Contentful Paint)** ✅

   - Measures loading performance
   - Good: ≤2.5s, Needs Improvement: ≤4s, Poor: >4s

2. **CLS (Cumulative Layout Shift)** ✅

   - Measures visual stability
   - Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25

3. **INP (Interaction to Next Paint)** ✅ _Replaces FID as of March 2024_
   - Measures responsiveness
   - Good: ≤200ms, Needs Improvement: ≤500ms, Poor: >500ms

### Additional Performance Metrics

4. **FCP (First Contentful Paint)** ✅

   - Measures perceived loading speed
   - Good: ≤1.8s, Needs Improvement: ≤3s, Poor: >3s

5. **TTFB (Time to First Byte)** ✅

   - Measures server response time
   - Good: ≤800ms, Needs Improvement: ≤1.8s, Poor: >1.8s

6. **FID (First Input Delay)** ⚠️ _Legacy - being replaced by INP_
   - Include for backward compatibility
   - Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms

## Database Schema Changes

### Add Columns to Events Table

```sql
-- Core Web Vitals
ALTER TABLE events ADD COLUMN lcp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN lcp_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN cls_value Nullable(Float64);
ALTER TABLE events ADD COLUMN cls_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN inp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN inp_rating LowCardinality(Nullable(String));

-- Additional Performance Metrics
ALTER TABLE events ADD COLUMN fcp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN fcp_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN ttfb_value Nullable(Float64);
ALTER TABLE events ADD COLUMN ttfb_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN fid_value Nullable(Float64);
ALTER TABLE events ADD COLUMN fid_rating LowCardinality(Nullable(String));
```

### Event Type Extension

Update the discriminated union to include `web_vital` type:

```typescript
// In trackEvent.ts
z.object({
  type: z.literal("web_vital"),
  site_id: z.string().min(1),
  hostname: z.string().max(253).optional(),
  pathname: z.string().max(2048).optional(),
  // ... other standard fields
  lcp_value: z.number().optional(),
  lcp_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  cls_value: z.number().optional(),
  cls_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  inp_value: z.number().optional(),
  inp_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  fcp_value: z.number().optional(),
  fcp_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  ttfb_value: z.number().optional(),
  ttfb_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  fid_value: z.number().optional(),
  fid_rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
});
```

## Client-Side Implementation

### Analytics Script Enhancement

```javascript
// In script-full.js
import { onLCP, onCLS, onINP, onFCP, onTTFB, onFID } from "web-vitals";

// Track pageview immediately
function trackPageview() {
  track({
    type: "pageview",
    pathname: window.location.pathname,
    // ... other pageview data
  });
}

// Collect web vitals
function initWebVitals() {
  const webVitalsData = {};

  onLCP((metric) => {
    webVitalsData.lcp = metric;
    sendWebVitalsIfComplete();
  });

  onCLS((metric) => {
    webVitalsData.cls = metric;
    sendWebVitalsIfComplete();
  });

  onINP((metric) => {
    webVitalsData.inp = metric;
    sendWebVitalsIfComplete();
  });

  onFCP((metric) => {
    webVitalsData.fcp = metric;
    sendWebVitalsIfComplete();
  });

  onTTFB((metric) => {
    webVitalsData.ttfb = metric;
    sendWebVitalsIfComplete();
  });

  onFID((metric) => {
    webVitalsData.fid = metric;
    sendWebVitalsIfComplete();
  });

  // Send web vitals on page visibility change
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendWebVitals();
    }
  });

  // Fallback: send after 10 seconds
  setTimeout(sendWebVitals, 10000);
}

function sendWebVitals() {
  if (Object.keys(webVitalsData).length === 0) return;

  track({
    type: "web_vital",
    pathname: window.location.pathname,
    lcp_value: webVitalsData.lcp?.value,
    lcp_rating: webVitalsData.lcp?.rating,
    cls_value: webVitalsData.cls?.value,
    cls_rating: webVitalsData.cls?.rating,
    inp_value: webVitalsData.inp?.value,
    inp_rating: webVitalsData.inp?.rating,
    fcp_value: webVitalsData.fcp?.value,
    fcp_rating: webVitalsData.fcp?.rating,
    ttfb_value: webVitalsData.ttfb?.value,
    ttfb_rating: webVitalsData.ttfb?.rating,
    fid_value: webVitalsData.fid?.value,
    fid_rating: webVitalsData.fid?.rating,
  });

  webVitalsData = {}; // Clear to prevent duplicate sends
}
```

## Server-Side API Endpoints

### New Performance Analytics APIs

```typescript
// server/src/api/analytics/getWebVitals.ts
export async function getWebVitals(req, res) {
  const query = `
    SELECT 
      pathname,
      count() as samples,
      avg(lcp_value) as avg_lcp,
      quantile(0.75)(lcp_value) as p75_lcp,
      avg(cls_value) as avg_cls,
      quantile(0.75)(cls_value) as p75_cls,
      avg(inp_value) as avg_inp,
      quantile(0.75)(inp_value) as p75_inp
    FROM events 
    WHERE site_id = {siteId:Int32} 
      AND type = 'web_vital'
      AND timestamp >= {startDate:String}
      AND timestamp <= {endDate:String}
    GROUP BY pathname
    ORDER BY samples DESC
  `;
}

// server/src/api/analytics/getWebVitalsTrends.ts
export async function getWebVitalsTrends(req, res) {
  const query = `
    SELECT 
      toStartOfDay(timestamp) as date,
      avg(lcp_value) as avg_lcp,
      quantile(0.75)(lcp_value) as p75_lcp,
      countIf(lcp_rating = 'good') / count() as lcp_good_ratio
    FROM events 
    WHERE site_id = {siteId:Int32} 
      AND type = 'web_vital'
      AND lcp_value IS NOT NULL
    GROUP BY date
    ORDER BY date
  `;
}
```

## Dashboard Implementation

### Performance Section Structure

```
client/src/app/[site]/performance/
├── page.tsx                    # Main performance dashboard
├── components/
│   ├── WebVitalsOverview.tsx   # Core Web Vitals summary cards
│   ├── MetricTrends.tsx        # Time-series charts
│   ├── PagePerformance.tsx     # Per-page breakdown
│   ├── PerformanceDistribution.tsx # Histogram charts
│   └── PerformanceFilters.tsx  # Date/page filtering
```

### Key Dashboard Features

1. **Overview Cards**: Current period averages for LCP, CLS, INP
2. **Trend Charts**: Performance over time with good/needs-improvement/poor zones
3. **Page Breakdown**: Performance metrics by individual pages
4. **Distribution Charts**: Histograms showing metric value distributions
5. **Core Web Vitals Score**: Overall site performance rating

## Implementation Phases

### Phase 1: Database Schema (Week 1)

- [ ] Add web vitals columns to events table
- [ ] Update trackEvent.ts validation schema
- [ ] Test schema changes in development

### Phase 2: Client-Side Collection (Week 2)

- [ ] Integrate web-vitals library into analytics script
- [ ] Implement web vitals collection and sending
- [ ] Test across different browsers and devices

### Phase 3: Server-Side APIs (Week 3)

- [ ] Create web vitals analytics endpoints
- [ ] Implement performance queries and aggregations
- [ ] Add proper error handling and validation

### Phase 4: Dashboard UI (Week 4)

- [ ] Build performance dashboard components
- [ ] Create charts and visualizations
- [ ] Add navigation and filtering

### Phase 5: Testing & Optimization (Week 5)

- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Documentation and deployment

## Performance Impact Summary

**Expected Impact on Existing Analytics:**

- **Query Performance**: <5% slower due to larger table size
- **Storage Growth**: ~70% increase (acceptable for web vitals insights)
- **Mitigation**: All pageview queries properly filter by `type = 'pageview'`

**Benefits:**

- Industry-standard performance tracking
- Simplified schema (no rating columns)
- Flexible threshold adjustments
- Comprehensive performance insights

This plan provides comprehensive web vitals tracking while maintaining the performance and simplicity of your existing analytics architecture.
