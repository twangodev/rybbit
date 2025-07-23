import { Queue, QueueEvents, JobsOptions } from 'bullmq';
import { eq } from 'drizzle-orm';
import { db } from '../../db/postgres/postgres.js';
import { uptimeMonitors } from '../../db/postgres/schema.js';
import { MonitorCheckJob } from './types.js';

export class MonitorSchedulerBullMQ {
  private queue: Queue;
  private queueEvents: QueueEvents;
  private isShuttingDown = false;
  private connection: { host: string; port: number; password?: string };

  constructor() {
    // Get Dragonfly connection from environment
    this.connection = {
      host: process.env.DRAGONFLY_HOST || 'localhost',
      port: parseInt(process.env.DRAGONFLY_PORT || '6379', 10),
      ...(process.env.DRAGONFLY_PASSWORD && { password: process.env.DRAGONFLY_PASSWORD })
    };
    
    console.log(`BullMQ connecting to Dragonfly at ${this.connection.host}:${this.connection.port}`);
    
    this.queue = new Queue('monitor-checks', {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: {
          count: 100, // Keep last 100 completed jobs
          age: 3600 // Keep for 1 hour
        },
        removeOnFail: {
          count: 100, // Keep last 100 failed jobs
          age: 86400 // Keep for 24 hours
        }
      }
    });
    
    this.queueEvents = new QueueEvents('monitor-checks', {
      connection: this.connection
    });
  }

  async initialize(): Promise<void> {
    console.log('Initializing BullMQ monitor scheduler...');
    
    // Wait for queue to be ready
    await this.queue.waitUntilReady();
    await this.queueEvents.waitUntilReady();
    
    console.log('BullMQ queue ready');
    
    // Clear any stale jobs from previous runs
    await this.clearStaleJobs();
    
    // Load and schedule all active monitors
    await this.loadAndScheduleMonitors();
    
    console.log('BullMQ monitor scheduler initialized');
  }

  private async clearStaleJobs(): Promise<void> {
    try {
      // Clean up old jobs
      const jobs = await this.queue.getJobs(['delayed', 'waiting', 'active']);
      console.log(`Found ${jobs.length} existing jobs`);
      
      // Remove all existing jobs
      await Promise.all(jobs.map(job => job.remove()));
      
      console.log('Cleared all stale jobs');
    } catch (error) {
      console.error('Error clearing stale jobs:', error);
    }
  }

  private async loadAndScheduleMonitors(): Promise<void> {
    try {
      // Load all enabled monitors
      const monitors = await db
        .select()
        .from(uptimeMonitors)
        .where(eq(uptimeMonitors.enabled, true));
      
      console.log(`Found ${monitors.length} enabled monitors`);
      
      // Schedule each monitor
      for (const monitor of monitors) {
        await this.scheduleMonitor(monitor.id, monitor.intervalSeconds);
      }
    } catch (error) {
      console.error('Error loading monitors:', error);
    }
  }

  async scheduleMonitor(monitorId: number, intervalSeconds: number): Promise<void> {
    if (this.isShuttingDown) return;
    
    try {
      // Remove existing jobs for this monitor
      await this.removeMonitorSchedule(monitorId);
      
      const jobName = `monitor-${monitorId}`;
      const jobData: MonitorCheckJob = {
        monitorId,
        intervalSeconds
      };
      
      // Add recurring job using repeat option
      const job = await this.queue.add(
        jobName,
        jobData,
        {
          repeat: {
            every: intervalSeconds * 1000, // Convert to milliseconds
            immediately: true // Run immediately on first schedule
          },
          jobId: jobName // Use monitor ID as job ID to prevent duplicates
        }
      );
      
      console.log(`Scheduled monitor ${monitorId} to run every ${intervalSeconds} seconds (job: ${job.id})`);
    } catch (error) {
      console.error(`Error scheduling monitor ${monitorId}:`, error);
    }
  }

  async removeMonitorSchedule(monitorId: number): Promise<void> {
    try {
      const jobName = `monitor-${monitorId}`;
      
      // Get all jobs for this monitor
      const jobs = await this.queue.getJobs(['delayed', 'waiting', 'active', 'completed', 'failed']);
      const monitorJobs = jobs.filter(job => job.name === jobName || job.id === jobName);
      
      // Remove all jobs for this monitor
      await Promise.all(monitorJobs.map(job => job.remove()));
      
      // Remove repeatable job configuration
      const repeatableJobs = await this.queue.getRepeatableJobs();
      const monitorRepeatableJobs = repeatableJobs.filter(
        job => job.name === jobName || job.id === jobName
      );
      
      await Promise.all(
        monitorRepeatableJobs.map(job => 
          this.queue.removeRepeatableByKey(job.key)
        )
      );
      
      console.log(`Removed schedule for monitor ${monitorId}`);
    } catch (error) {
      console.error(`Error removing monitor schedule ${monitorId}:`, error);
    }
  }

  async updateMonitorSchedule(monitorId: number, intervalSeconds: number): Promise<void> {
    await this.scheduleMonitor(monitorId, intervalSeconds);
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down BullMQ monitor scheduler...');
    this.isShuttingDown = true;
    
    try {
      // Close queue events first
      await this.queueEvents.close();
      
      // Then close the queue
      await this.queue.close();
      
      console.log('BullMQ monitor scheduler shut down successfully');
    } catch (error) {
      console.error('Error during scheduler shutdown:', error);
    }
  }

  getQueue(): Queue {
    return this.queue;
  }
}