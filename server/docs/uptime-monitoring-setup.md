# Uptime Monitoring Setup

The uptime monitoring system uses BullMQ with Dragonfly for job scheduling and execution.

## Prerequisites

1. **Dragonfly** - A Redis-compatible in-memory datastore
   - Can be deployed on the same server or a separate server
   - Default port: 6379

## Environment Variables

Add these to your `.env` file:

```env
# Dragonfly configuration
DRAGONFLY_HOST=your-server-ip  # e.g., 5.78.110.218
DRAGONFLY_PORT=6379            # Default Dragonfly port
DRAGONFLY_PASSWORD=your-secure-password  # Required for production
```

## Dragonfly Installation

### On Ubuntu/Debian:

```bash
# Install Dragonfly
curl -L https://github.com/dragonflydb/dragonfly/releases/latest/download/dragonfly-x86_64.tar.gz | tar xz
sudo mv dragonfly /usr/local/bin/

# Create systemd service
sudo tee /etc/systemd/system/dragonfly.service > /dev/null <<EOF
[Unit]
Description=Dragonfly In-Memory Datastore
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/dragonfly --logtostderr
Restart=always
User=dragonfly
Group=dragonfly

[Install]
WantedBy=multi-user.target
EOF

# Create user and start service
sudo useradd -r -s /bin/false dragonfly
sudo systemctl enable dragonfly
sudo systemctl start dragonfly
```

### Using Docker:

```bash
docker run -d \
  --name dragonfly \
  -p 6379:6379 \
  --restart unless-stopped \
  docker.dragonflydb.io/dragonflydb/dragonfly
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

### Check Dragonfly Connection
```bash
redis-cli -h YOUR_DRAGONFLY_HOST ping
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