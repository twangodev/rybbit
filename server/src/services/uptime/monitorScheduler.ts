import PgBoss from 'pg-boss';
import { eq } from 'drizzle-orm';
import { db } from '../../db/postgres/postgres.js';
import { uptimeMonitors } from '../../db/postgres/schema.js';
import { MonitorCheckJob } from './types.js';

export class MonitorScheduler {
  private boss: PgBoss;
  private isShuttingDown = false;

  constructor(connectionString: string) {
    this.boss = new PgBoss({
      connectionString,
      schema: 'pgboss', // Use a dedicated schema for pg-boss
      monitorStateIntervalSeconds: 30,
      maintenanceIntervalSeconds: 120,
    });
  }

  async initialize(): Promise<void> {
    console.log('Initializing monitor scheduler...');
    
    // Start pg-boss
    await this.boss.start();
    
    // Clear any stale schedules from previous runs
    await this.clearStaleSchedules();
    
    // Load and schedule all active monitors
    await this.loadAndScheduleMonitors();
    
    console.log('Monitor scheduler initialized');
  }

  private async clearStaleSchedules(): Promise<void> {
    try {
      // Get all scheduled jobs
      const schedules = await this.boss.getSchedules();
      
      // Remove all monitor schedules (they start with 'check-monitor-')
      for (const schedule of schedules) {
        if (schedule.name.startsWith('check-monitor-')) {
          await this.boss.unschedule(schedule.name);
        }
      }
      
      console.log(`Cleared ${schedules.length} stale schedules`);
    } catch (error) {
      console.error('Error clearing stale schedules:', error);
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
      const jobName = `check-monitor-${monitorId}`;
      
      // Remove existing schedule if any
      await this.removeMonitorSchedule(monitorId);
      
      // Schedule the job using pg-boss interval syntax
      await this.boss.schedule(
        jobName,
        `${intervalSeconds} seconds`,
        { monitorId },
        {
          singletonKey: `monitor-${monitorId}`, // Ensure only one instance runs
          singletonSeconds: intervalSeconds, // Don't allow overlapping
        }
      );
      
      console.log(`Scheduled monitor ${monitorId} to run every ${intervalSeconds} seconds`);
    } catch (error) {
      console.error(`Error scheduling monitor ${monitorId}:`, error);
    }
  }

  async removeMonitorSchedule(monitorId: number): Promise<void> {
    try {
      const jobName = `check-monitor-${monitorId}`;
      
      // Unschedule the job
      await this.boss.unschedule(jobName);
      
      // Also cancel any pending jobs for this monitor
      // pg-boss cancel requires specific job IDs, not job names
      // We'll skip this for now as scheduled jobs are automatically replaced
      
      console.log(`Removed schedule for monitor ${monitorId}`);
    } catch (error) {
      console.error(`Error removing monitor schedule ${monitorId}:`, error);
    }
  }

  async updateMonitorSchedule(monitorId: number, intervalSeconds: number): Promise<void> {
    await this.scheduleMonitor(monitorId, intervalSeconds);
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down monitor scheduler...');
    this.isShuttingDown = true;
    
    try {
      // Stop pg-boss
      await this.boss.stop({
        graceful: true,
        timeout: 30000, // 30 seconds
      });
      
      console.log('Monitor scheduler shut down successfully');
    } catch (error) {
      console.error('Error during scheduler shutdown:', error);
    }
  }

  getBoss(): PgBoss {
    return this.boss;
  }
}