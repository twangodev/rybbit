# VPS-Based Global Monitoring Architecture

## Overview
Instead of using Cloudflare Workers, we'll deploy lightweight monitoring agents on VPS instances in 4 key regions: US-East, US-West, Europe, and Asia. These agents will execute monitoring checks and report results back to the main server.

## Architecture Components

### 1. Main Server (Existing)
- Continues to handle all API requests, authentication, and data storage
- Schedules monitoring jobs
- Aggregates results from regional agents
- Serves the web interface

### 2. Regional Monitor Agents (New)
- Lightweight Node.js/Go services running on VPS instances
- Execute HTTP, TCP, SMTP, DNS, and other protocol checks
- Report results back to main server via authenticated API
- Self-contained with minimal dependencies

### 3. Communication Flow
```
Main Server (BullMQ Scheduler)
    ↓ (HTTPS POST with job details)
Regional Agents (us-east, us-west, europe, asia)
    ↓ (Execute checks)
    ↓ (HTTPS POST results back)
Main Server (Store in ClickHouse)
```

## Regional Agent Specification

### Directory Structure
```
monitor-agent/
├── src/
│   ├── index.ts           # Main entry point
│   ├── config.ts          # Configuration management
│   ├── api/
│   │   ├── server.ts      # Express/Fastify server
│   │   └── auth.ts        # Authentication middleware
│   ├── monitors/
│   │   ├── http.ts        # HTTP/HTTPS monitoring
│   │   ├── tcp.ts         # TCP port monitoring
│   │   ├── dns.ts         # DNS monitoring
│   │   ├── smtp.ts        # SMTP monitoring
│   │   └── ping.ts        # ICMP ping monitoring
│   ├── utils/
│   │   ├── logger.ts      # Logging utilities
│   │   └── metrics.ts     # Performance metrics
│   └── types.ts           # TypeScript types
├── Dockerfile             # Container definition
├── docker-compose.yml     # Local development
├── package.json
├── tsconfig.json
└── README.md
```

### Agent API Endpoints

#### POST /execute
Execute a monitoring check
```typescript
interface ExecuteRequest {
  jobId: string;
  monitorId: number;
  monitorType: "http" | "tcp" | "dns" | "smtp" | "ping";
  config: MonitorConfig;
  validationRules: ValidationRule[];
}

interface ExecuteResponse {
  jobId: string;
  region: string;
  status: "success" | "failure" | "timeout";
  responseTimeMs: number;
  statusCode?: number;
  headers?: Record<string, string>;
  timing?: TimingInfo;
  error?: ErrorInfo;
}
```

#### GET /health
Health check endpoint for monitoring the agent itself

#### GET /metrics
Prometheus-compatible metrics endpoint

### Security

1. **Authentication**: Shared secret key between main server and agents
2. **Rate Limiting**: Prevent abuse of agent resources
3. **IP Whitelisting**: Only accept requests from main server
4. **TLS**: All communication over HTTPS

## Main Server Updates

### 1. Database Schema
```sql
-- Add agent_regions table
CREATE TABLE agent_regions (
  code VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  endpoint_url VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_health_check TIMESTAMP,
  is_healthy BOOLEAN DEFAULT true
);

-- Insert initial regions
INSERT INTO agent_regions (code, name, endpoint_url) VALUES
('us-east', 'US East (Virginia)', 'https://us-east.monitor.your-domain.com'),
('us-west', 'US West (California)', 'https://us-west.monitor.your-domain.com'),
('europe', 'Europe (Frankfurt)', 'https://europe.monitor.your-domain.com'),
('asia', 'Asia (Singapore)', 'https://asia.monitor.your-domain.com');

-- Update monitors table
ALTER TABLE uptime_monitors 
ADD COLUMN monitoring_type VARCHAR(20) DEFAULT 'local',
ADD COLUMN selected_regions TEXT[] DEFAULT ARRAY['local'];
```

### 2. Monitor Executor Updates
```typescript
// monitorExecutorBullMQ.ts modifications
private async executeGlobalCheck(monitor: Monitor): Promise<void> {
  const regions = await getActiveRegions(monitor.selected_regions);
  
  const promises = regions.map(region => 
    executeRegionalCheck(monitor, region)
  );
  
  const results = await Promise.allSettled(promises);
  
  // Store each regional result
  for (const [index, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      await storeMonitorEvent(result.value);
    } else {
      await storeErrorEvent(monitor, regions[index], result.reason);
    }
  }
}

async function executeRegionalCheck(monitor: Monitor, region: Region): Promise<CheckResult> {
  const response = await fetch(`${region.endpoint_url}/execute`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${region.api_key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobId: generateJobId(),
      monitorId: monitor.id,
      monitorType: monitor.monitorType,
      config: monitor.config,
      validationRules: monitor.validationRules
    })
  });
  
  return response.json();
}
```

### 3. Frontend Updates

#### Monitor Creation/Edit
- Add monitoring type selector (Local vs Global)
- Show region checkboxes for global monitoring
- Display costs/pricing information

#### Monitor List
- Show badge indicating monitoring type
- Display active regions for global monitors

#### Monitor Details
- Region filter for viewing specific region data
- Aggregate view across all regions
- Region-specific response time charts

## Deployment Strategy

### 1. VPS Providers & Locations
- **US-East**: DigitalOcean NYC or Vultr New Jersey ($5/month)
- **US-West**: Vultr Los Angeles or Linode Fremont ($5/month)
- **Europe**: Hetzner Frankfurt or DigitalOcean Amsterdam ($3.50/month)
- **Asia**: Vultr Singapore or Linode Singapore ($5/month)

**Total Infrastructure Cost**: ~$18.50/month for 4 regions

### 2. Agent Deployment
```bash
# Deploy script for each region
#!/bin/bash
REGION=$1
docker build -t monitor-agent .
docker tag monitor-agent registry.your-domain.com/monitor-agent:$REGION
docker push registry.your-domain.com/monitor-agent:$REGION

# SSH to VPS and deploy
ssh $REGION_HOST "docker pull registry.your-domain.com/monitor-agent:$REGION && docker run -d --name monitor-agent -p 443:3000 --restart always monitor-agent:$REGION"
```

### 3. Monitoring the Monitors
- Use main server to health check each agent
- Alert if agent is down
- Automatic failover to local monitoring if agent fails

## Implementation Timeline

### Phase 1: Agent Development (Week 1)
- [ ] Create monitor-agent directory structure
- [ ] Implement basic Express/Fastify server
- [ ] Add HTTP monitoring capability
- [ ] Add TCP monitoring capability
- [ ] Implement authentication

### Phase 2: Main Server Integration (Week 2)
- [ ] Update database schema
- [ ] Modify monitor executor for multi-region
- [ ] Add region health checking
- [ ] Update API endpoints

### Phase 3: Extended Protocols (Week 3)
- [ ] Add DNS monitoring to agent
- [ ] Add SMTP monitoring to agent
- [ ] Add PING monitoring to agent
- [ ] Add custom TCP protocol support

### Phase 4: Frontend & Deployment (Week 4)
- [ ] Update monitor dialog with region selection
- [ ] Add region filtering to monitor details
- [ ] Deploy agents to VPS instances
- [ ] Production testing

## Advantages Over Cloudflare Workers

1. **Full Protocol Support**: Can monitor any TCP/UDP based protocol
2. **Lower Costs**: ~$20/month for 4 regions vs ~$400/month for Cloudflare
3. **More Control**: Full access to networking stack
4. **Flexibility**: Can add custom monitoring types easily
5. **No Vendor Lock-in**: Can move between VPS providers

## Code Examples

### Agent HTTP Monitor Implementation
```typescript
// monitor-agent/src/monitors/http.ts
import { request } from 'undici';

export async function performHttpCheck(config: HttpConfig): Promise<HttpCheckResult> {
  const startTime = performance.now();
  const timing: TimingInfo = {};
  
  try {
    // DNS lookup
    const dnsStart = performance.now();
    // ... DNS resolution
    timing.dnsMs = performance.now() - dnsStart;
    
    // Make request
    const response = await request(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.body,
      bodyTimeout: config.timeoutMs,
      headersTimeout: config.timeoutMs,
    });
    
    timing.ttfbMs = performance.now() - startTime;
    
    // Read body
    const body = await response.body.text();
    timing.transferMs = performance.now() - startTime - timing.ttfbMs;
    
    return {
      status: 'success',
      statusCode: response.statusCode,
      headers: response.headers,
      responseTimeMs: performance.now() - startTime,
      timing,
      bodySizeBytes: Buffer.byteLength(body)
    };
  } catch (error) {
    return {
      status: 'failure',
      responseTimeMs: performance.now() - startTime,
      error: {
        message: error.message,
        type: error.code || 'unknown'
      }
    };
  }
}
```

### Main Server Region Selection UI
```typescript
// Region selector component
export function RegionSelector({ value, onChange }: RegionSelectorProps) {
  const regions = [
    { code: 'us-east', name: 'US East', flag: '🇺🇸' },
    { code: 'us-west', name: 'US West', flag: '🇺🇸' },
    { code: 'europe', name: 'Europe', flag: '🇪🇺' },
    { code: 'asia', name: 'Asia', flag: '🇸🇬' }
  ];
  
  return (
    <div className="space-y-2">
      <Label>Monitoring Regions</Label>
      <div className="grid grid-cols-2 gap-2">
        {regions.map(region => (
          <label key={region.code} className="flex items-center space-x-2">
            <Checkbox
              checked={value.includes(region.code)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...value, region.code]);
                } else {
                  onChange(value.filter(r => r !== region.code));
                }
              }}
            />
            <span>{region.flag} {region.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```