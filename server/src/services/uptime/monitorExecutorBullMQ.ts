import { Worker, Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db } from '../../db/postgres/postgres.js';
import { uptimeMonitors, uptimeMonitorStatus } from '../../db/postgres/schema.js';
import { clickhouse } from '../../db/clickhouse/clickhouse.js';
import { MonitorCheckJob, HttpCheckResult, TcpCheckResult, MonitorEvent } from './types.js';
import { performHttpCheck } from './checks/httpCheck.js';
import { performTcpCheck } from './checks/tcpCheck.js';
import { applyValidationRules } from './validationEngine.js';

export class MonitorExecutorBullMQ {
  private worker: Worker | null = null;
  private concurrency: number;
  private isShuttingDown = false;
  private connection: { host: string; port: number; password?: string };

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
    this.connection = {
      host: process.env.DRAGONFLY_HOST || 'localhost',
      port: parseInt(process.env.DRAGONFLY_PORT || '6379', 10),
      ...(process.env.DRAGONFLY_PASSWORD && { password: process.env.DRAGONFLY_PASSWORD })
    };
  }

  async start(): Promise<void> {
    console.log(`Starting BullMQ monitor executor with concurrency: ${this.concurrency}`);

    // Create worker to process jobs
    this.worker = new Worker(
      'monitor-checks',
      async (job: Job<MonitorCheckJob>) => {
        console.log(`🔍 Processing monitor check job ${job.name} for monitor ${job.data.monitorId}`);
        await this.processMonitorCheck(job.data);
        console.log(`✅ Completed monitor check job ${job.name}`);
      },
      {
        connection: this.connection,
        concurrency: this.concurrency,
        autorun: true,
        removeOnComplete: {
          count: 100
        },
        removeOnFail: {
          count: 100
        }
      }
    );

    // Set up event listeners
    this.worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('Worker error:', err);
    });

    this.worker.on('ready', () => {
      console.log('BullMQ worker is ready and listening for jobs');
    });

    this.worker.on('active', (job) => {
      console.log(`Job ${job.id} is now active`);
    });

    // Wait for worker to be ready
    await new Promise<void>((resolve) => {
      if (this.worker) {
        this.worker.once('ready', () => {
          resolve();
        });
      }
    });

    console.log('BullMQ monitor executor started successfully');
  }

  private async processMonitorCheck(jobData: MonitorCheckJob): Promise<void> {
    const { monitorId } = jobData;

    try {
      console.log(`🔍 Starting to process monitor check for monitor ID: ${monitorId}`);

      // Fetch monitor configuration
      const monitor = await db.query.uptimeMonitors.findFirst({
        where: eq(uptimeMonitors.id, monitorId),
      });

      if (!monitor || !monitor.enabled) {
        console.log(`Monitor ${monitorId} not found or disabled`);
        return;
      }

      // Perform the check based on monitor type
      let result: HttpCheckResult | TcpCheckResult;
      let responseBody: string | undefined;

      if (monitor.monitorType === "http" && monitor.httpConfig) {
        const httpResult = await performHttpCheck({
          url: monitor.httpConfig.url,
          method: monitor.httpConfig.method || "GET",
          headers: monitor.httpConfig.headers,
          body: monitor.httpConfig.body,
          auth: monitor.httpConfig.auth,
          followRedirects: monitor.httpConfig.followRedirects !== false,
          timeoutMs: monitor.httpConfig.timeoutMs,
          ipVersion: monitor.httpConfig.ipVersion,
          userAgent: monitor.httpConfig.userAgent,
        });

        result = httpResult;

        // For HTTP checks, we might need the response body for validation
        // Note: In production, you might want to limit body size or make this optional
        if (httpResult.status === "success" && monitor.validationRules.length > 0) {
          // For now, we'll skip body validation to avoid memory issues
          // In a real implementation, you'd stream the body or limit size
          responseBody = undefined;
        }
      } else if (monitor.monitorType === "tcp" && monitor.tcpConfig) {
        result = await performTcpCheck({
          host: monitor.tcpConfig.host,
          port: monitor.tcpConfig.port,
          timeoutMs: monitor.tcpConfig.timeoutMs,
        });
      } else {
        throw new Error(`Invalid monitor configuration for monitor ${monitorId}`);
      }

      // Apply validation rules for successful checks
      if (result.status === "success" && monitor.validationRules.length > 0) {
        const validationErrors = applyValidationRules(result as HttpCheckResult, monitor.validationRules, responseBody);

        if (validationErrors.length > 0) {
          result.validationErrors = validationErrors;
          // Change status to failure if validation fails
          result.status = "failure";
        }
      }

      // Store result in ClickHouse
      await this.storeMonitorEvent(monitor, result);

      // Update monitor status in PostgreSQL
      await this.updateMonitorStatus(monitor.id, result);

      console.log(`✅ Monitor check completed: ${monitorId} - ${result.status} (${result.responseTimeMs}ms)`);
    } catch (error) {
      console.error(`Error processing monitor check ${monitorId}:`, error);

      // Try to store the error event
      try {
        const monitor = await db.query.uptimeMonitors.findFirst({
          where: eq(uptimeMonitors.id, monitorId),
        });

        if (monitor) {
          const errorResult: HttpCheckResult = {
            status: "failure",
            responseTimeMs: 0,
            timing: {},
            headers: {},
            bodySizeBytes: 0,
            validationErrors: [],
            error: {
              message: error instanceof Error ? error.message : "Internal error during monitor check",
              type: "internal_error",
            },
          };

          await this.storeMonitorEvent(monitor, errorResult);
          await this.updateMonitorStatus(monitor.id, errorResult);
        }
      } catch (innerError) {
        console.error("Failed to store error event:", innerError);
      }
    }
  }

  private async storeMonitorEvent(monitor: any, result: HttpCheckResult | TcpCheckResult): Promise<void> {
    const event: MonitorEvent = {
      monitor_id: monitor.id,
      organization_id: monitor.organizationId,
      timestamp: new Date(),
      monitor_type: monitor.monitorType,
      monitor_url: monitor.httpConfig?.url || `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`,
      monitor_name: monitor.name,
      region: "local",
      status: result.status,
      status_code: (result as HttpCheckResult).statusCode,
      response_time_ms: result.responseTimeMs,
      dns_time_ms: (result as HttpCheckResult).timing?.dnsMs,
      tcp_time_ms: (result as HttpCheckResult).timing?.tcpMs,
      tls_time_ms: (result as HttpCheckResult).timing?.tlsMs,
      ttfb_ms: (result as HttpCheckResult).timing?.ttfbMs,
      transfer_time_ms: (result as HttpCheckResult).timing?.transferMs,
      validation_errors: result.validationErrors,
      response_headers: (result as HttpCheckResult).headers || {},
      response_size_bytes: (result as HttpCheckResult).bodySizeBytes,
      port: monitor.tcpConfig?.port,
      error_message: result.error?.message,
      error_type: result.error?.type,
    };

    try {
      await clickhouse.insert({
        table: "monitor_events",
        values: [event],
        format: "JSONEachRow",
      });
    } catch (error) {
      console.error("Failed to store monitor event in ClickHouse:", error);
    }
  }

  private async updateMonitorStatus(monitorId: number, result: HttpCheckResult | TcpCheckResult): Promise<void> {
    try {
      const now = new Date();
      const currentStatus = result.status === "success" ? "up" : "down";

      // Get current status to update consecutive counts
      const existingStatus = await db.query.uptimeMonitorStatus.findFirst({
        where: eq(uptimeMonitorStatus.monitorId, monitorId),
      });

      let consecutiveFailures = existingStatus?.consecutiveFailures || 0;
      let consecutiveSuccesses = existingStatus?.consecutiveSuccesses || 0;

      if (currentStatus === "up") {
        consecutiveSuccesses++;
        consecutiveFailures = 0;
      } else {
        consecutiveFailures++;
        consecutiveSuccesses = 0;
      }

      // Update or insert status
      if (existingStatus) {
        await db
          .update(uptimeMonitorStatus)
          .set({
            lastCheckedAt: now.toISOString(),
            currentStatus,
            consecutiveFailures,
            consecutiveSuccesses,
            updatedAt: now.toISOString(),
          })
          .where(eq(uptimeMonitorStatus.monitorId, monitorId));
      } else {
        await db.insert(uptimeMonitorStatus).values({
          monitorId,
          lastCheckedAt: now.toISOString(),
          currentStatus,
          consecutiveFailures,
          consecutiveSuccesses,
          updatedAt: now.toISOString(),
        });
      }

      // TODO: Calculate and update uptime percentages asynchronously
      // This would involve querying ClickHouse for historical data
    } catch (error) {
      console.error("Failed to update monitor status:", error);
    }
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down BullMQ monitor executor...");
    this.isShuttingDown = true;

    if (this.worker) {
      await this.worker.close();
      console.log("BullMQ monitor executor shut down successfully");
    }
  }
}