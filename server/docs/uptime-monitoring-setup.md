# Uptime Monitoring Setup

The uptime monitoring system uses BullMQ with Redis for job scheduling and execution.

## Prerequisites

1. **Redis** - In-memory data structure store
   - Can be deployed on the same server or a separate server
   - Default port: 6379

## Environment Variables

Add these to your `.env` file:

```env
# Redis configuration
REDIS_HOST=your-server-ip  # e.g., 5.78.110.218
REDIS_PORT=6379           # Default Redis port
REDIS_PASSWORD=your-secure-password  # Required for production
```

## Redis Installation

### On Ubuntu/Debian:

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf
# Set: requirepass your-secure-password
# Set: bind 0.0.0.0 (to allow external connections)
# Set: protected-mode no (if using password)

# Start Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### Using Docker:

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:7-alpine redis-server --requirepass your-secure-password --appendonly yes
```

## How It Works

1. **Monitor Scheduler** (`monitorSchedulerBullMQ.ts`)
   - Creates recurring jobs in BullMQ based on monitor interval settings
   - Each monitor has its own job with a unique ID
   - Jobs are automatically retried on failure

2. **Monitor Executor** (`monitorExecutorBullMQ.ts`)
   - Processes jobs from the queue with configurable concurrency
   - Performs HTTP/TCP checks based on monitor configuration
   - Stores results in ClickHouse and updates status in PostgreSQL

3. **Job Management**
   - Jobs are scheduled using BullMQ's repeat feature
   - Failed jobs are retried up to 3 times
   - Job history is maintained for debugging

## Troubleshooting

### Check Redis Connection
```bash
redis-cli -h YOUR_REDIS_HOST -a YOUR_REDIS_PASSWORD ping
# Should return: PONG
```

### Monitor Queue Status
The system logs queue status and job processing. Check server logs for:
- "BullMQ queue ready"
- "Scheduled monitor X to run every Y seconds"
- "Processing monitor check job"

### Common Issues

1. **Connection Refused**
   - Ensure Dragonfly is running on the specified host/port
   - Check firewall rules allow connection on port 6379

2. **Jobs Not Processing**
   - Verify monitor is enabled in the database
   - Check server logs for error messages
   - Ensure worker is running (check for "BullMQ worker is ready")

3. **Jobs Running Too Frequently/Infrequently**
   - Check monitor's intervalSeconds in database
   - Verify system time is synchronized