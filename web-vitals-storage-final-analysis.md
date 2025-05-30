# Web Vitals Storage: Dedicated Columns vs Separate Table Analysis

## The Question: Dedicated Columns with Sparse Data vs Separate Table

You raise an excellent point about storage efficiency. Let's analyze both approaches:

## Option A: Add Columns to Existing Events Table

```sql
ALTER TABLE events ADD COLUMN lcp_value Float64;
ALTER TABLE events ADD COLUMN lcp_rating LowCardinality(String);
ALTER TABLE events ADD COLUMN fid_value Float64;
ALTER TABLE events ADD COLUMN fid_rating LowCardinality(String);
ALTER TABLE events ADD COLUMN cls_value Float64;
ALTER TABLE events ADD COLUMN cls_rating LowCardinality(String);
```

### Storage Impact Analysis:

- **Sparse Data**: Only pageview events (~80% of events) would have web vitals data
- **Custom Events**: ~20% of events would have NULL web vitals columns
- **ClickHouse Compression**: NULL values compress extremely well in ClickHouse
- **Column Storage**: ClickHouse stores columns separately, so unused columns have minimal impact

### Benefits:

- ✅ **Single Query Complexity**: All your existing complex CTEs work seamlessly
- ✅ **Performance**: Direct column access, no JOINs needed
- ✅ **Consistency**: Same partitioning, ordering, and indexing as pageviews
- ✅ **Minimal Storage Overhead**: NULLs compress to almost nothing in ClickHouse

### Example Query (maintains your existing pattern):

```sql
WITH EventTimes AS (
    SELECT
        session_id,
        pathname,
        timestamp,
        lcp_value,
        fid_value,
        cls_value,
        leadInFrame(timestamp) OVER (PARTITION BY session_id ORDER BY timestamp ROWS BETWEEN CURRENT ROW AND 1 FOLLOWING) as next_timestamp
    FROM events
    WHERE
      site_id = {siteId:Int32}
      AND type = 'pageview'
      AND lcp_value IS NOT NULL  -- Only pages with web vitals
),
PagePerformance AS (
    SELECT
        pathname,
        count() as visits,
        avg(lcp_value) as avg_lcp,
        quantile(0.75)(lcp_value) as p75_lcp,
        avg(fid_value) as avg_fid,
        avg(cls_value) as avg_cls
    FROM EventTimes
    GROUP BY pathname
)
SELECT * FROM PagePerformance ORDER BY visits DESC;
```

---

## Option B: Separate Web Vitals Table

```sql
CREATE TABLE web_vitals (
  site_id UInt16,
  timestamp DateTime,
  session_id String,
  user_id String,
  pathname String,
  page_title String,
  lcp_value Float64,
  lcp_rating LowCardinality(String),
  fid_value Float64,
  fid_rating LowCardinality(String),
  cls_value Float64,
  cls_rating LowCardinality(String),
  browser LowCardinality(String),
  device_type LowCardinality(String),
  country LowCardinality(FixedString(2))
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (site_id, pathname, timestamp);
```

### Benefits:

- ✅ **No Sparse Data**: Every row has web vitals data
- ✅ **Optimized Schema**: Only relevant columns for performance analytics
- ✅ **Faster Aggregations**: Smaller table, better cache locality
- ✅ **Independent Evolution**: Can optimize separately from main events

### Drawbacks:

- ❌ **Complex Correlation Queries**: Need JOINs to correlate with pageviews
- ❌ **Data Duplication**: Some fields duplicated from events table
- ❌ **Separate Pipeline**: Need separate ingestion and processing logic

### Example Query (requires JOINs):

```sql
WITH PageStats AS (
    SELECT
        pathname,
        count() as total_pageviews,
        count(DISTINCT session_id) as unique_sessions
    FROM events
    WHERE site_id = {siteId:Int32} AND type = 'pageview'
    GROUP BY pathname
),
WebVitalStats AS (
    SELECT
        pathname,
        count() as vitals_count,
        avg(lcp_value) as avg_lcp,
        quantile(0.75)(lcp_value) as p75_lcp
    FROM web_vitals
    WHERE site_id = {siteId:Int32}
    GROUP BY pathname
)
SELECT
    p.pathname,
    p.total_pageviews,
    p.unique_sessions,
    w.avg_lcp,
    w.p75_lcp,
    (w.vitals_count / p.total_pageviews) as vitals_coverage
FROM PageStats p
LEFT JOIN WebVitalStats w ON p.pathname = w.pathname;
```

---

## ClickHouse Storage Efficiency Analysis

### NULL Column Storage in ClickHouse:

- **Compression**: ClickHouse compresses NULL values extremely efficiently
- **Column Storage**: Each column is stored separately, unused columns don't affect query performance
- **Memory Usage**: NULL columns use minimal memory during queries

### Real Storage Impact:

```
Events table with 1M rows:
- 800K pageviews (potential web vitals)
- 200K custom events (NULL web vitals)

Storage overhead for 6 web vitals columns:
- With data: ~800K × 6 × 8 bytes = ~38MB
- NULL values: ~200K × 6 × 1 bit = ~150KB
- Total overhead: ~38MB (minimal impact)
```

---

## Recommendation: **Add Columns to Events Table**

### Rationale:

1. **Query Simplicity**: Your existing complex analytics patterns work unchanged
2. **Performance**: No JOINs needed, maintains existing query performance
3. **Storage Efficiency**: ClickHouse handles sparse columns extremely well
4. **Implementation Speed**: Single schema change vs building entire new pipeline
5. **Data Consistency**: Same partitioning and ordering as pageviews

### Implementation Strategy:

```sql
-- Add columns (can be done online in ClickHouse)
ALTER TABLE events ADD COLUMN lcp_value Nullable(Float64);
ALTER TABLE events ADD COLUMN lcp_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN fid_value Nullable(Float64);
ALTER TABLE events ADD COLUMN fid_rating LowCardinality(Nullable(String));
ALTER TABLE events ADD COLUMN cls_value Nullable(Float64);
ALTER TABLE events ADD COLUMN cls_rating LowCardinality(Nullable(String));
```

### Migration Path:

1. Add columns to events table
2. Update tracking script to collect web vitals with pageviews
3. Modify pageview processing to include web vitals data
4. Build performance analytics using existing query patterns
5. If needed later, can create materialized views for specialized performance queries

This approach gives you the best balance of performance, simplicity, and storage efficiency while leveraging your existing sophisticated analytics infrastructure.
