# Web Vitals Storage Options Analysis

## Option A: Add Web Vitals Columns to Events Table

**Approach**: Add dedicated columns for LCP, FID, CLS to the existing events table

```sql
ALTER TABLE events ADD COLUMN lcp_value Float64;
ALTER TABLE events ADD COLUMN lcp_rating LowCardinality(String);
ALTER TABLE events ADD COLUMN fid_value Float64;
ALTER TABLE events ADD COLUMN fid_rating LowCardinality(String);
ALTER TABLE events ADD COLUMN cls_value Float64;
ALTER TABLE events ADD COLUMN cls_rating LowCardinality(String);
```

### Benefits:

- ✅ **Perfect Data Correlation**: Web vitals directly tied to each pageview
- ✅ **Optimal Query Performance**: No JSON parsing, direct column access
- ✅ **Simple Analytics**: Easy to calculate averages, percentiles across pages
- ✅ **Efficient Storage**: Numeric columns compress better than JSON
- ✅ **Clean Data Model**: One row per page load with all performance data

### Downsides:

- ❌ **Schema Migration Required**: Need to alter production table
- ❌ **Sparse Data**: Many NULL values for older records
- ❌ **Timing Complexity**: Web vitals arrive after pageview, need update mechanism
- ❌ **Fixed Schema**: Hard to add new metrics later without more migrations

---

## Option B: Store Web Vitals in Props JSON Field

**Approach**: Include web vitals data in the existing `props` JSON field of pageview events

```json
{
  "type": "pageview",
  "props": {
    "web_vitals": {
      "lcp": { "value": 2500, "rating": "needs-improvement" },
      "fid": { "value": 150, "rating": "good" },
      "cls": { "value": 0.05, "rating": "good" }
    }
  }
}
```

### Benefits:

- ✅ **No Schema Changes**: Uses existing infrastructure
- ✅ **Flexible Structure**: Easy to add new metrics
- ✅ **Single Row Per Pageview**: Clean data model
- ✅ **Immediate Implementation**: Can start collecting today
- ✅ **Backward Compatible**: Doesn't affect existing data

### Downsides:

- ❌ **JSON Parsing Overhead**: Slower queries for aggregations
- ❌ **Complex Queries**: Need JSONExtract functions for analysis
- ❌ **Less Efficient Storage**: JSON overhead vs native columns
- ❌ **Timing Issues**: Still need to handle delayed web vitals

---

## Option C: Delayed Web Vitals Collection

**Approach**: Send pageview immediately, then send web vitals as separate events when available

```javascript
// Initial pageview
track({ type: "pageview", pathname: "/home" });

// Later when web vitals are available
track({ type: "web_vital", metric: "LCP", value: 2500, pageview_id: "abc123" });
```

### Benefits:

- ✅ **No Timing Issues**: Each metric sent when ready
- ✅ **Accurate Measurements**: No rushed or incomplete data
- ✅ **Flexible Collection**: Can handle varying metric availability
- ✅ **No Schema Changes**: Uses existing event system

### Downsides:

- ❌ **Data Fragmentation**: Multiple rows per page load
- ❌ **Complex Correlation**: Need to join pageviews with web vitals
- ❌ **Increased Storage**: More rows in database
- ❌ **Query Complexity**: Harder to analyze page performance

---

## Option D: Hybrid Update Approach

**Approach**: Insert pageview immediately, then update the same row with web vitals when available

```sql
-- Initial insert
INSERT INTO events (type, pathname, ...) VALUES ('pageview', '/home', ...);

-- Later update with web vitals
UPDATE events SET
  lcp_value = 2500, lcp_rating = 'needs-improvement',
  fid_value = 150, fid_rating = 'good'
WHERE session_id = 'sess_123' AND pathname = '/home' AND timestamp = '...';
```

### Benefits:

- ✅ **Single Row Per Pageview**: Clean data model
- ✅ **Optimal Performance**: Direct column access
- ✅ **Complete Data**: All page data in one place
- ✅ **Accurate Timing**: Metrics collected when actually available

### Downsides:

- ❌ **ClickHouse Limitation**: Updates are expensive and not recommended
- ❌ **Performance Impact**: Updates can slow down the system
- ❌ **Complexity**: Need to track which rows to update
- ❌ **Race Conditions**: Multiple updates to same row

---

## Recommendation Analysis

### Technical Constraints:

- **ClickHouse Nature**: Optimized for inserts, not updates (eliminates Option D)
- **Web Vitals Timing**: Metrics available 0-10 seconds after page load
- **Current Architecture**: Event-based system with batch processing

### Recommended Approach: **Option B (Props JSON Field)**

**Rationale**:

1. **Immediate Implementation**: No schema changes or migrations
2. **Handles Timing**: Can collect web vitals when available and batch with pageview
3. **Future-Proof**: Easy to add new performance metrics
4. **Proven Pattern**: Already used for custom event properties

### Implementation Strategy:

```javascript
// Collect pageview and web vitals together
const webVitals = await collectWebVitals(); // Wait up to 5 seconds
track({
  type: "pageview",
  pathname: "/home",
  props: JSON.stringify({
    web_vitals: webVitals,
  }),
});
```

### Query Performance Optimization:

```sql
-- Create materialized view for fast web vitals queries
CREATE MATERIALIZED VIEW web_vitals_mv AS
SELECT
  site_id,
  pathname,
  timestamp,
  JSONExtractFloat(props, 'web_vitals.lcp.value') as lcp_value,
  JSONExtractString(props, 'web_vitals.lcp.rating') as lcp_rating,
  JSONExtractFloat(props, 'web_vitals.fid.value') as fid_value,
  JSONExtractString(props, 'web_vitals.fid.rating') as fid_rating,
  JSONExtractFloat(props, 'web_vitals.cls.value') as cls_value,
  JSONExtractString(props, 'web_vitals.cls.rating') as cls_rating
FROM events
WHERE type = 'pageview' AND JSONHas(props, 'web_vitals');
```

This approach provides the best balance of implementation speed, data integrity, and query performance.
