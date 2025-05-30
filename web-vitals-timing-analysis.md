# Web Vitals Timing Challenge: Pageview vs Web Vitals Collection

## The Core Problem

You've identified a critical timing issue:

1. **Pageview Event**: Fires immediately when page loads
2. **Web Vitals**: Available 0-10 seconds later (LCP, FID, CLS need time to measure)
3. **ClickHouse**: Optimized for inserts, not updates

## Web Vitals Timing Breakdown

### LCP (Largest Contentful Paint)

- **When Available**: 0-4 seconds after page load
- **Triggers**: When largest content element finishes rendering
- **Can Change**: Yes, until user interaction or page becomes hidden

### FID (First Input Delay)

- **When Available**: Only after first user interaction
- **Triggers**: On first click, tap, or key press
- **Can Change**: No, only measured once

### CLS (Cumulative Layout Shift)

- **When Available**: Continuously measured
- **Triggers**: On page visibility change or beforeunload
- **Can Change**: Yes, accumulates over page lifetime

## Possible Solutions

### Solution 1: Delayed Pageview (Wait for Web Vitals)

```javascript
// Wait up to 5 seconds for web vitals, then send pageview
const webVitals = await collectWebVitalsWithTimeout(5000);
track({
  type: "pageview",
  pathname: "/home",
  lcp_value: webVitals.lcp?.value,
  fid_value: webVitals.fid?.value,
  cls_value: webVitals.cls?.value,
});
```

**Pros**: Single row, complete data
**Cons**: Delayed analytics, potential data loss if user leaves quickly

### Solution 2: Separate Web Vitals Events

```javascript
// Send pageview immediately
track({ type: "pageview", pathname: "/home" });

// Send web vitals when available
onWebVital((metric) => {
  track({
    type: "web_vital",
    metric: metric.name,
    value: metric.value,
    pathname: "/home",
  });
});
```

**Pros**: Immediate pageview tracking, accurate timing
**Cons**: Multiple rows per page, complex correlation

### Solution 3: Hybrid Approach (Recommended)

```javascript
// Send pageview immediately
const pageviewId = generateId();
track({
  type: "pageview",
  pathname: "/home",
  pageview_id: pageviewId,
});

// Send web vitals batch when page becomes hidden
window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const webVitals = getCurrentWebVitals();
    track({
      type: "web_vitals_batch",
      pageview_id: pageviewId,
      pathname: "/home",
      lcp_value: webVitals.lcp?.value,
      fid_value: webVitals.fid?.value,
      cls_value: webVitals.cls?.value,
    });
  }
});
```

### Solution 4: Materialized View Approach

Store as separate events but create a materialized view that combines them:

```sql
CREATE MATERIALIZED VIEW pageviews_with_vitals AS
SELECT
  p.site_id,
  p.timestamp,
  p.session_id,
  p.pathname,
  p.page_title,
  -- Standard pageview data
  p.browser,
  p.device_type,
  p.country,
  -- Web vitals from separate events
  w.lcp_value,
  w.fid_value,
  w.cls_value
FROM events p
LEFT JOIN (
  SELECT
    session_id,
    pathname,
    argMax(lcp_value, timestamp) as lcp_value,
    argMax(fid_value, timestamp) as fid_value,
    argMax(cls_value, timestamp) as cls_value
  FROM events
  WHERE type = 'web_vital'
  GROUP BY session_id, pathname
) w ON p.session_id = w.session_id AND p.pathname = w.pathname
WHERE p.type = 'pageview';
```

## Recommended Implementation Strategy

### Phase 1: Separate Events with Correlation

1. Keep immediate pageview tracking
2. Send web vitals as separate events when available
3. Use session_id + pathname + timestamp window for correlation

### Phase 2: Materialized View for Performance

1. Create materialized view that joins pageviews with web vitals
2. Use this view for performance analytics
3. Maintains query simplicity while handling timing complexity

### Schema Design:

```sql
-- Events table (existing)
-- pageview events: immediate
-- web_vital events: when available

-- New materialized view
CREATE MATERIALIZED VIEW pageview_performance AS
SELECT
  p.*,
  v.lcp_value,
  v.lcp_rating,
  v.fid_value,
  v.fid_rating,
  v.cls_value,
  v.cls_rating
FROM events p
LEFT JOIN (
  SELECT
    session_id,
    pathname,
    toStartOfMinute(timestamp) as time_bucket,
    argMax(JSONExtractFloat(props, 'lcp.value'), timestamp) as lcp_value,
    argMax(JSONExtractString(props, 'lcp.rating'), timestamp) as lcp_rating,
    argMax(JSONExtractFloat(props, 'fid.value'), timestamp) as fid_value,
    argMax(JSONExtractString(props, 'fid.rating'), timestamp) as fid_rating,
    argMax(JSONExtractFloat(props, 'cls.value'), timestamp) as cls_value,
    argMax(JSONExtractString(props, 'cls.rating'), timestamp) as cls_rating
  FROM events
  WHERE type = 'web_vital'
  GROUP BY session_id, pathname, time_bucket
) v ON p.session_id = v.session_id
     AND p.pathname = v.pathname
     AND toStartOfMinute(p.timestamp) = v.time_bucket
WHERE p.type = 'pageview';
```

This approach:

- ✅ Preserves immediate pageview tracking
- ✅ Handles web vitals timing naturally
- ✅ Provides unified view for analytics
- ✅ Maintains data integrity
- ✅ Allows complex queries on combined data
