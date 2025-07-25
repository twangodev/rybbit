# Uptime Monitor Events Table Migration Guide

This guide will help you migrate your existing `monitor_events` table from `DateTime64(3)` to `DateTime` type to fix timezone issues.

## Background

The `monitor_events` table was originally created with `DateTime64(3)` for the timestamp column, which stores timestamps with millisecond precision. However, this causes timezone handling issues when compared to other tables that use regular `DateTime` type. This migration converts the timestamp to regular `DateTime` (second precision) for consistency.

## Prerequisites

- Access to your ClickHouse instance
- Backup of your data (recommended)
- Brief downtime window (a few seconds to minutes depending on data size)

## Migration Steps

### Step 1: Check Current Table Structure

First, verify your current table structure:

```sql
DESCRIBE TABLE monitor_events;
```

If the `timestamp` column shows `DateTime64(3)`, proceed with the migration.

### Step 2: Create a Backup (Optional but Recommended)

Create a backup of your existing data:

```sql
CREATE TABLE monitor_events_backup AS 
SELECT * FROM monitor_events;
```

### Step 3: Create New Table with Correct Schema

Create the new table with `DateTime` type:

```sql
CREATE TABLE monitor_events_new (
  monitor_id UInt32,
  organization_id String,
  timestamp DateTime,  -- Changed from DateTime64(3) to DateTime
  
  -- Monitor metadata
  monitor_type LowCardinality(String),
  monitor_url String,
  monitor_name String,
  region LowCardinality(String) DEFAULT 'local',
  
  -- Response data
  status LowCardinality(String),
  status_code Nullable(UInt16),
  response_time_ms UInt32,
  
  -- HTTP timing breakdown (all in milliseconds)
  dns_time_ms Nullable(UInt32),
  tcp_time_ms Nullable(UInt32),
  tls_time_ms Nullable(UInt32),
  ttfb_ms Nullable(UInt32),
  transfer_time_ms Nullable(UInt32),
  
  -- Validation results
  validation_errors Array(String),
  
  -- Response metadata (for HTTP)
  response_headers Map(String, String),
  response_size_bytes Nullable(UInt32),
  
  -- TCP specific
  port Nullable(UInt16),
  
  -- Error information
  error_message Nullable(String),
  error_type Nullable(String)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (organization_id, monitor_id, timestamp)
SETTINGS ttl_only_drop_parts = 1;
```

### Step 4: Copy Data to New Table

Copy all data from the old table to the new one, converting the timestamp:

```sql
INSERT INTO monitor_events_new 
SELECT 
  monitor_id,
  organization_id,
  toDateTime(timestamp) as timestamp,  -- Converts DateTime64 to DateTime
  monitor_type,
  monitor_url,
  monitor_name,
  region,
  status,
  status_code,
  response_time_ms,
  dns_time_ms,
  tcp_time_ms,
  tls_time_ms,
  ttfb_ms,
  transfer_time_ms,
  validation_errors,
  response_headers,
  response_size_bytes,
  port,
  error_message,
  error_type
FROM monitor_events;
```

### Step 5: Verify Data Migration

Check that the data was copied correctly:

```sql
-- Compare row counts
SELECT count() FROM monitor_events;
SELECT count() FROM monitor_events_new;

-- Sample some data
SELECT * FROM monitor_events_new LIMIT 10;
```

### Step 6: Rename Tables

Once you're satisfied with the migration, rename the tables:

```sql
-- Rename old table (keep as backup)
RENAME TABLE monitor_events TO monitor_events_old;

-- Rename new table to production name
RENAME TABLE monitor_events_new TO monitor_events;
```

### Step 7: Clean Up

After verifying everything works correctly for a few days, you can drop the old tables:

```sql
-- Drop the backup tables (only after confirming everything works)
DROP TABLE monitor_events_old;
DROP TABLE monitor_events_backup;  -- if you created a backup
```

## Alternative: In-Place Migration (Higher Risk)

If you're confident and want to migrate without creating a new table, you can try modifying the column directly:

```sql
ALTER TABLE monitor_events 
MODIFY COLUMN timestamp DateTime;
```

**Note**: This approach may not work depending on your ClickHouse version and could potentially fail. The table copy method above is safer.

## Post-Migration Notes

1. **Timezone Handling**: After migration, all timestamps will be stored in UTC. The application has been updated to:
   - Store all new timestamps in UTC
   - Handle timezone conversions properly in queries

2. **Precision Loss**: Converting from `DateTime64(3)` to `DateTime` loses millisecond precision. For uptime monitoring with minute-level intervals, this is acceptable.

3. **Performance**: The regular `DateTime` type is more efficient for queries and timezone conversions.

## Troubleshooting

If you encounter issues:

1. **Table is locked**: Wait for any running queries to complete or kill them using `KILL QUERY` command
2. **Out of disk space**: The migration temporarily requires 2x the table size. Free up space if needed.
3. **Query timeout**: For very large tables, you may need to increase the query timeout or migrate in batches

## Rollback Plan

If something goes wrong:

```sql
-- If you haven't dropped the old table yet
DROP TABLE IF EXISTS monitor_events;
RENAME TABLE monitor_events_old TO monitor_events;
```

This will restore the original table with `DateTime64(3)` type.