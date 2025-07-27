import { Worker, Job } from 'bullmq';
import { eq, and, inArray } from 'drizzle-orm';
import { DateTime } from 'luxon';
import { db } from '../../db/postgres/postgres.js';
import { uptimeMonitors, uptimeMonitorStatus, agentRegions } from '../../db/postgres/schema.js';
import { clickhouse } from '../../db/clickhouse/clickhouse.js';
import { MonitorCheckJob, HttpCheckResult, TcpCheckResult, MonitorEvent } from './types.js';
import { performHttpCheck } from './checks/httpCheck.js';
import { performTcpCheck } from './checks/tcpCheck.js';
import { applyValidationRules } from './validationEngine.js';

interface AgentExecuteRequest {
  jobId: string;
  monitorId: number;
  monitorType: string;
  config: any;
  validationRules: any[];
}

interface AgentExecuteResponse {
  jobId: string;
  region: string;
  status: "success" | "failure" | "timeout";
  responseTimeMs: number;
  statusCode?: number;
  headers?: Record<string, string>;
  timing?: {
    dnsMs?: number;
    tcpMs?: number;
    tlsMs?: number;
    ttfbMs?: number;
    transferMs?: number;
  };
  error?: {
    message: string;
    type: string;
  };
  validationErrors?: string[];
  bodySizeBytes?: number;
}

export class MonitorExecutorBullMQ {
  private worker: Worker | null = null;
  private concurrency: number;
  private isShuttingDown = false;
  private connection: { host: string; port: number; password?: string };

  constructor(concurrency: number = 10) {
    this.concurrency = concurrency;
    this.connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD })
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

      // Check if this is a global monitor
      if (monitor.monitoringType === 'global' && monitor.selectedRegions && monitor.selectedRegions.length > 0) {
        await this.processGlobalMonitorCheck(monitor);
        return;
      }

      // For local monitoring, proceed with the original logic
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

  private async processGlobalMonitorCheck(monitor: any): Promise<void> {
    try {
      // Filter to only include non-local regions
      const globalRegions = monitor.selectedRegions.filter((r: string) => r !== 'local');
      
      if (globalRegions.length === 0) {
        console.log(`Monitor ${monitor.id} has no global regions selected`);
        return;
      }

      // Fetch agent regions information
      const regions = await db.query.agentRegions.findMany({
        where: and(
          inArray(agentRegions.code, globalRegions),
          eq(agentRegions.enabled, true),
          eq(agentRegions.isHealthy, true)
        ),
      });

      if (regions.length === 0) {
        console.log(`No healthy regions found for monitor ${monitor.id}`);
        return;
      }

      // Execute checks in parallel across all regions
      const regionPromises = regions.map(region => 
        this.executeAgentCheck(monitor, region).catch(error => {
          console.error(`Error executing check in region ${region.code}:`, error);
          return {
            region: region.code,
            result: {
              status: "failure" as const,
              responseTimeMs: 0,
              timing: {},
              headers: {},
              bodySizeBytes: 0,
              validationErrors: [],
              error: {
                message: error instanceof Error ? error.message : "Agent communication error",
                type: "agent_error",
              },
            } as HttpCheckResult,
          };
        })
      );

      const regionResults = await Promise.all(regionPromises);

      // Store results for each region
      for (const { region, result } of regionResults) {
        await this.storeMonitorEvent(monitor, result, region);
      }

      // Update monitor status based on the majority of regions
      const successCount = regionResults.filter(r => r.result.status === "success").length;
      const overallStatus = successCount > regionResults.length / 2 ? "success" : "failure";
      
      // Use the average response time from successful checks
      const successfulResults = regionResults.filter(r => r.result.status === "success");
      const avgResponseTime = successfulResults.length > 0
        ? successfulResults.reduce((sum, r) => sum + r.result.responseTimeMs, 0) / successfulResults.length
        : 0;

      const aggregatedResult: HttpCheckResult = {
        status: overallStatus === "success" ? "success" : "failure",
        responseTimeMs: avgResponseTime,
        timing: {},
        headers: {},
        bodySizeBytes: 0,
        validationErrors: [],
      };

      await this.updateMonitorStatus(monitor.id, aggregatedResult);

      console.log(`✅ Global monitor check completed: ${monitor.id} - ${overallStatus} (${regionResults.length} regions)`);
    } catch (error) {
      console.error(`Error processing global monitor check ${monitor.id}:`, error);
    }
  }

  private async executeAgentCheck(monitor: any, region: any): Promise<{ region: string; result: HttpCheckResult | TcpCheckResult }> {
    const jobId = `${monitor.id}-${Date.now()}-${region.code}`;
    
    const request: AgentExecuteRequest = {
      jobId,
      monitorId: monitor.id,
      monitorType: monitor.monitorType,
      config: monitor.monitorType === 'http' ? monitor.httpConfig : monitor.tcpConfig,
      validationRules: monitor.validationRules || [],
    };

    try {
      const response = await fetch(`${region.endpointUrl}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(60000), // 60 second timeout
      });

      if (!response.ok) {
        throw new Error(`Agent returned status ${response.status}`);
      }

      const agentResponse: AgentExecuteResponse = await response.json();

      // Convert agent response to our internal format
      const result: HttpCheckResult | TcpCheckResult = monitor.monitorType === 'http'
        ? {
            status: agentResponse.status,
            statusCode: agentResponse.statusCode,
            responseTimeMs: agentResponse.responseTimeMs,
            timing: agentResponse.timing || {},
            headers: agentResponse.headers || {},
            bodySizeBytes: agentResponse.bodySizeBytes || 0,
            validationErrors: agentResponse.validationErrors || [],
            error: agentResponse.error,
          }
        : {
            status: agentResponse.status,
            responseTimeMs: agentResponse.responseTimeMs,
            validationErrors: [],
            error: agentResponse.error,
          };

      return { region: region.code, result };
    } catch (error) {
      console.error(`Failed to execute check via agent ${region.code}:`, error);
      throw error;
    }
  }

  private async storeMonitorEvent(monitor: any, result: HttpCheckResult | TcpCheckResult, regionCode: string = "local"): Promise<void> {
    const event: MonitorEvent = {
      monitor_id: monitor.id,
      organization_id: monitor.organizationId,
      timestamp: DateTime.now().toUTC().toFormat("yyyy-MM-dd HH:mm:ss"),
      monitor_type: monitor.monitorType,
      monitor_url: monitor.httpConfig?.url || `${monitor.tcpConfig?.host}:${monitor.tcpConfig?.port}`,
      monitor_name: monitor.name,
      region: regionCode,
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
    } catch (error) {
      console.error("Failed to update monitor status:", error);
    }
  }

  async shutdown(): Promise<void> {
    console.log("Shutting down BullMQ monitor executor...");
    this.isShuttingDown = true;

    if (this.worker) {
      try {
        // Close the worker with a timeout
        await Promise.race([
          this.worker.close(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Worker close timeout')), 5000)
          )
        ]);
        console.log("BullMQ monitor executor shut down successfully");
      } catch (error) {
        console.error("Error closing worker:", error);
        // Force close if needed
        this.worker = null;
      }
    }
  }
}