# Uptime Monitoring Specification

## Overview
This specification outlines the implementation of an uptime monitoring system for Frogstats. The system will support HTTP/HTTPS and TCP monitoring with configurable intervals, validation rules, and multi-region capabilities (scaffolding only initially).

## Database Schema

### ClickHouse - Monitor Events Storage

```sql
CREATE TABLE IF NOT EXISTS monitor_events (
  monitor_id UInt32,
  organization_id String,
  timestamp DateTime64(3),
  
  -- Monitor metadata
  monitor_type LowCardinality(String), -- 'http', 'tcp'
  monitor_url String,
  monitor_name String,
  region LowCardinality(String) DEFAULT 'local',
  
  -- Response data
  status LowCardinality(String), -- 'success', 'failure', 'timeout'
  status_code Nullable(UInt16), -- HTTP status code
  response_time_ms UInt32,
  
  -- HTTP timing breakdown (all in milliseconds)
  dns_time_ms Nullable(UInt32),
  tcp_time_ms Nullable(UInt32),
  tls_time_ms Nullable(UInt32),
  ttfb_ms Nullable(UInt32), -- Time to first byte
  transfer_time_ms Nullable(UInt32),
  
  -- Validation results
  validation_errors Array(String), -- Array of failed validation rules
  
  -- Response metadata (for HTTP)
  response_headers Map(String, String),
  response_size_bytes Nullable(UInt32),
  
  -- TCP specific
  port Nullable(UInt16),
  
  -- Error information
  error_message Nullable(String),
  error_type Nullable(String) -- 'dns_failure', 'connection_timeout', 'ssl_error', etc.
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (organization_id, monitor_id, timestamp)
SETTINGS ttl_only_drop_parts = 1;
```

### PostgreSQL - Monitor Configuration

```sql
-- Monitor definitions
CREATE TABLE uptime_monitors (
  id SERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organization(id),
  name TEXT NOT NULL,
  monitor_type TEXT NOT NULL, -- 'http', 'tcp'
  
  -- Common settings
  interval_seconds INTEGER NOT NULL CHECK (interval_seconds >= 1 AND interval_seconds <= 86400),
  enabled BOOLEAN DEFAULT true,
  
  -- HTTP/HTTPS specific configuration
  http_config JSONB, -- {
    -- url: string,
    -- method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH',
    -- headers: Record<string, string>,
    -- body: string,
    -- auth: {
    --   type: 'none' | 'basic' | 'bearer' | 'api_key' | 'custom_header',
    --   credentials: { /* auth-specific fields */ }
    -- },
    -- follow_redirects: boolean,
    -- timeout_ms: number,
    -- ip_version: 'any' | 'ipv4' | 'ipv6'
  -- }
  
  -- TCP specific configuration
  tcp_config JSONB, -- {
    -- host: string,
    -- port: number,
    -- timeout_ms: number
  -- }
  
  -- Validation rules
  validation_rules JSONB NOT NULL DEFAULT '[]'::jsonb, -- [
    -- { type: 'status_code', operator: 'equals' | 'not_equals' | 'in' | 'not_in', value: number | number[] },
    -- { type: 'response_time', operator: 'less_than' | 'greater_than', value: number },
    -- { type: 'response_body_contains', value: string, case_sensitive: boolean },
    -- { type: 'response_body_not_contains', value: string, case_sensitive: boolean },
    -- { type: 'header_exists', header: string },
    -- { type: 'header_value', header: string, operator: 'equals' | 'contains', value: string },
    -- { type: 'response_size', operator: 'less_than' | 'greater_than', value: number }
  -- ]
  
  -- Multi-region configuration (for future use)
  regions JSONB DEFAULT '["local"]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL REFERENCES user(id)
);

-- Monitor status tracking
CREATE TABLE uptime_monitor_status (
  monitor_id INTEGER PRIMARY KEY REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  last_checked_at TIMESTAMP,
  next_check_at TIMESTAMP,
  current_status TEXT DEFAULT 'unknown', -- 'up', 'down', 'unknown'
  consecutive_failures INTEGER DEFAULT 0,
  consecutive_successes INTEGER DEFAULT 0,
  uptime_percentage_24h REAL,
  uptime_percentage_7d REAL,
  uptime_percentage_30d REAL,
  average_response_time_24h REAL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert configuration (scaffolding)
CREATE TABLE uptime_alerts (
  id SERIAL PRIMARY KEY,
  monitor_id INTEGER NOT NULL REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'email', 'webhook', 'slack', etc.
  alert_config JSONB NOT NULL, -- Type-specific configuration
  conditions JSONB NOT NULL, -- {
    -- consecutive_failures: number,
    -- response_time_threshold_ms: number,
    -- uptime_percentage_threshold: number
  -- }
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alert history (scaffolding)
CREATE TABLE uptime_alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER NOT NULL REFERENCES uptime_alerts(id) ON DELETE CASCADE,
  monitor_id INTEGER NOT NULL REFERENCES uptime_monitors(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  alert_data JSONB -- Context about what triggered the alert
);
```

## API Endpoints

All endpoints require authentication and will use the user's active organization from their session.

### Monitor Management

#### GET /api/uptime/monitors
- List all monitors for the user's organization
- Query params: `?enabled=true`, `?monitor_type=http`
- Returns: Array of monitor objects with current status

#### GET /api/uptime/monitors/:monitorId
- Get single monitor details including configuration and current status

#### POST /api/uptime/monitors
- Create new monitor
- Body: Monitor configuration object
- Returns: Created monitor with ID

#### PUT /api/uptime/monitors/:monitorId
- Update monitor configuration
- Body: Partial monitor configuration
- Returns: Updated monitor

#### DELETE /api/uptime/monitors/:monitorId
- Delete monitor (soft delete or cascade)

### Monitor Data & Analytics

#### GET /api/uptime/monitors/:monitorId/events
- Get monitor check events
- Query params: `?start_date=`, `?end_date=`, `?limit=`, `?offset=`
- Returns: Paginated list of monitor events

#### GET /api/uptime/monitors/:monitorId/stats
- Get aggregated statistics
- Query params: `?period=24h|7d|30d|custom`, `?start_date=`, `?end_date=`
- Returns: Uptime percentage, average response time, response time distribution

#### GET /api/uptime/monitors/:monitorId/status
- Get current monitor status and recent incidents

### Alerts (Scaffolding)

#### GET /api/uptime/monitors/:monitorId/alerts
#### POST /api/uptime/monitors/:monitorId/alerts
#### PUT /api/uptime/monitors/:monitorId/alerts/:alertId
#### DELETE /api/uptime/monitors/:monitorId/alerts/:alertId

## Frontend Structure

### Pages
- `/uptime` - Monitor dashboard/list view
- `/uptime/create` - Create new monitor
- `/uptime/:monitorId` - Monitor detail view with charts
- `/uptime/:monitorId/edit` - Edit monitor configuration
- `/uptime/:monitorId/alerts` - Alert configuration (scaffolding)

### Components
```
client/src/app/uptime/
├── page.tsx                    # Monitor list/dashboard
├── create/
│   └── page.tsx               # Create monitor form
├── [monitorId]/
│   ├── page.tsx               # Monitor detail view
│   ├── edit/
│   │   └── page.tsx           # Edit monitor
│   └── alerts/
│       └── page.tsx           # Alert configuration
└── components/
    ├── MonitorList.tsx
    ├── MonitorCard.tsx
    ├── MonitorForm.tsx
    ├── MonitorStatusBadge.tsx
    ├── UptimeChart.tsx
    ├── ResponseTimeChart.tsx
    └── MonitorEventsList.tsx
```

### API Client & React Query Hooks
```
client/src/api/uptime/
├── monitors.ts                 # CRUD operations
├── useGetMonitors.ts
├── useGetMonitor.ts
├── useCreateMonitor.ts
├── useUpdateMonitor.ts
├── useDeleteMonitor.ts
├── events.ts                   # Monitor events
├── useGetMonitorEvents.ts
├── useGetMonitorStats.ts
└── useGetMonitorStatus.ts
```

## Implementation Notes

### Monitor Execution
1. Initially, monitors will run locally on the server
2. Use a job queue (Bull/BullMQ) or cron-based system
3. Respect configured intervals per monitor
4. Handle timeouts and retries gracefully

### Authentication Methods Support
- **Basic Auth**: Username/password in Authorization header
- **Bearer Token**: Token in Authorization header
- **API Key**: Custom header with key/value
- **Custom Headers**: Any header key/value pairs

### Extensibility Considerations
1. Monitor types designed as plugins (http/tcp initially)
2. Validation rules as JSON array for easy extension
3. Alert types as separate table with JSON config
4. Multi-region support via regions array and region field in events

### Performance Considerations
1. Batch insert monitor events to ClickHouse
2. Use materialized views for common aggregations
3. Implement proper indexing on PostgreSQL tables
4. Cache monitor status in Redis (optional)

### Security Considerations
1. Encrypt sensitive auth credentials in database
2. Validate URLs to prevent SSRF attacks
3. Implement rate limiting per monitor
4. Audit log for monitor configuration changes

## Future Enhancements
1. Multi-region monitoring via Cloudflare Workers
2. Advanced alerting (PagerDuty, Slack, SMS)
3. Status pages
4. SSL certificate monitoring
5. DNS monitoring
6. Ping monitoring
7. Port scanning
8. Synthetic monitoring (browser automation)
9. API workflow monitoring
10. Maintenance windows