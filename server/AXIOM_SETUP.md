# Axiom Logging Setup

This guide explains how to configure Axiom for centralized logging in the Rybbit server.

## Prerequisites

1. Create an Axiom account at https://axiom.co
2. Create a new dataset for your logs (e.g., "rybbit-logs")
3. Generate an API token with ingest permissions

## Configuration

Add the following environment variables to your `.env` file:

```env
# Axiom logging
AXIOM_DATASET=your-dataset-name
AXIOM_TOKEN=xaat-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## How It Works

When both `AXIOM_DATASET` and `AXIOM_TOKEN` are set in production:

1. All logs from the Fastify server and service loggers are sent to Axiom
2. Logs are also written to stdout for container/server logs
3. In development, logs continue to use pino-pretty for readable output
4. In production without Axiom, logs use the one-line logger format

## Log Structure

All logs include:
- Service name (e.g., "monitor-scheduler", "notification-service")
- Structured data as the first parameter
- Log level (info, warn, error, debug)
- Timestamp and other metadata

Example:
```javascript
logger.info({ monitorId: 123, region: "us-east-1" }, "Health check completed");
```

## Viewing Logs in Axiom

1. Go to your Axiom dashboard
2. Select your dataset
3. Use APL (Axiom Processing Language) to query logs:

```apl
// View all errors
| where level == "error"

// View logs from a specific service
| where service == "notification-service"

// View logs for a specific monitor
| where monitorId == 123
```

## Benefits

- Centralized logging across all services
- Powerful search and analytics
- Real-time log streaming
- Alerts and dashboards
- No log rotation needed
- Cost-effective for high volume

## Troubleshooting

If logs aren't appearing in Axiom:
1. Check that environment variables are set correctly
2. Verify the API token has ingest permissions
3. Check the dataset name matches exactly
4. Look for connection errors in stdout logs