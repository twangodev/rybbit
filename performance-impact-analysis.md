# Performance Impact Analysis: Adding Performance Events

## Requested Changes

1. ✅ Remove FID (deprecated metric)
2. ✅ Change event type from "web_vital" to "performance"
3. 🤔 Remove rating columns (compute on-the-fly vs store)
4. 🤔 Impact of 2x rows on pageview analytics performance

## Storage & Performance Analysis

### Rating Columns: Store vs Compute

#### Option A: Store Ratings (Current Plan)

```sql
-- Storage impact with LowCardinality
lcp_rating LowCardinality(Nullable(String))  -- ~1 byte per row
cls_rating LowCardinality(Nullable(String))  -- ~1 byte per row
inp_rating LowCardinality(Nullable(String))  -- ~1 byte per row
```

**Pros:**

- Instant query performance for rating-based filters/aggregations
- No CPU overhead for rating computation
- Total storage overhead: ~3 bytes per performance event

**Cons:**

- Slightly more complex schema
- Redundant data (can be computed from values)

#### Option B: Compute Ratings On-The-Fly

```sql
-- Compute ratings in queries
CASE
  WHEN lcp_value <= 2500 THEN 'good'
  WHEN lcp_value <= 4000 THEN 'needs-improvement'
  ELSE 'poor'
END as lcp_rating
```

**Pros:**

- Simpler schema
- No redundant data storage
- Easy to adjust thresholds later

**Cons:**

- Small CPU overhead per query (~5-10ms for large datasets)
- More complex queries

**Recommendation:** Compute on-the-fly. The CPU overhead is negligible and keeps schema cleaner.

### 2x Rows Impact on Pageview Analytics

#### Current Query Pattern Analysis

```sql
-- Typical pageview query (from getSingleCol.ts)
SELECT count() as pageviews
FROM events
WHERE site_id = {siteId}
  AND type = 'pageview'  -- ✅ Properly filtered
  AND timestamp >= {start}
```

#### Performance Impact Assessment

**Minimal Impact Scenarios (95% of queries):**

- All existing pageview queries filter by `type = 'pageview'`
- ClickHouse's column-oriented storage means type filtering is very efficient
- Performance events won't be scanned for pageview analytics
- **Expected impact: <5% slower due to larger table metadata**

**Potential Impact Scenarios:**

```sql
-- Problematic: queries without type filter
SELECT count() FROM events WHERE site_id = {siteId}  -- ❌ Scans all events

-- Good: properly filtered
SELECT count() FROM events WHERE site_id = {siteId} AND type = 'pageview'  -- ✅ Fast
```

#### Mitigation Strategies

1. **Audit Existing Queries** - Ensure all have proper type filters
2. **Partitioning Strategy** - Consider partitioning by type if table grows large
3. **Materialized Views** - For complex cross-event analytics

### Updated Metrics (No FID)

```typescript
// Final metrics list
interface PerformanceMetrics {
  lcp_value?: number; // Largest Contentful Paint
  cls_value?: number; // Cumulative Layout Shift
  inp_value?: number; // Interaction to Next Paint
  fcp_value?: number; // First Contentful Paint
  ttfb_value?: number; // Time to First Byte
}
```

### Performance Event Volume Estimation

**Assumptions:**

- 70% of pageviews will generate performance events (some users leave too quickly)
- Performance events are smaller (no referrer, user agent, etc.)

**Storage Impact:**

```
Current: 1M pageviews/month = ~500MB
With Performance: 1M pageviews + 700K performance = ~850MB (+70%)
```

**Query Performance:**

- Pageview queries: <5% impact (due to larger table size)
- Performance queries: New capability
- Mixed queries: Need careful design

## Recommendations

### 1. Schema Design (Simplified)

```sql
-- Remove rating columns, compute on-the-fly
ALTER TABLE events ADD COLUMN lcp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN cls_value Nullable(Float64);
ALTER TABLE events ADD COLUMN inp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN fcp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN ttfb_value Nullable(Float64);
```

### 2. Query Optimization

```sql
-- Add index on (site_id, type, timestamp) if not exists
-- Ensure all analytics queries filter by type
WHERE site_id = {siteId} AND type = 'pageview'
```

### 3. Monitoring

- Track query performance before/after implementation
- Monitor table size growth
- Watch for queries missing type filters

## Conclusion

**Performance Impact: Minimal**

- Well-filtered queries will see <5% impact
- Storage increase of ~70% is manageable
- Rating computation overhead is negligible

**Recommended Approach:**

- ✅ Use "performance" event type
- ✅ Remove FID metric
- ✅ Compute ratings on-the-fly (no rating columns)
- ✅ Audit existing queries for proper type filtering
- ✅ Monitor performance post-implementation

The benefits of web vitals tracking far outweigh the minimal performance costs.
