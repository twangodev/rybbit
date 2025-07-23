import { MonitorSchedulerBullMQ } from './monitorSchedulerBullMQ.js';
import { MonitorExecutorBullMQ } from './monitorExecutorBullMQ.js';

export class UptimeServiceBullMQ {
  private scheduler: MonitorSchedulerBullMQ;
  private executor: MonitorExecutorBullMQ;
  private initialized = false;

  constructor() {
    this.scheduler = new MonitorSchedulerBullMQ();
    this.executor = new MonitorExecutorBullMQ(10); // 10 concurrent workers
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Uptime service already initialized');
      return;
    }
    
    try {
      console.log('Initializing BullMQ uptime monitoring service...');
      
      // Initialize scheduler (creates queue, loads and schedules all monitors)
      await this.scheduler.initialize();
      
      // Start executor (begins processing jobs)
      await this.executor.start();
      
      this.initialized = true;
      console.log('BullMQ uptime monitoring service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize uptime service:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down BullMQ uptime monitoring service...');
    
    try {
      // Shutdown executor first (stops processing new jobs)
      await this.executor.shutdown();
      
      // Then shutdown scheduler (closes queue)
      await this.scheduler.shutdown();
      
      this.initialized = false;
      console.log('BullMQ uptime monitoring service shut down successfully');
    } catch (error) {
      console.error('Error during uptime service shutdown:', error);
    }
  }

  // Methods for managing monitors after CRUD operations
  async onMonitorCreated(monitorId: number, intervalSeconds: number): Promise<void> {
    if (!this.initialized) return;
    await this.scheduler.scheduleMonitor(monitorId, intervalSeconds);
  }

  async onMonitorUpdated(monitorId: number, intervalSeconds: number, enabled: boolean): Promise<void> {
    if (!this.initialized) return;
    
    if (enabled) {
      await this.scheduler.updateMonitorSchedule(monitorId, intervalSeconds);
    } else {
      await this.scheduler.removeMonitorSchedule(monitorId);
    }
  }

  async onMonitorDeleted(monitorId: number): Promise<void> {
    if (!this.initialized) return;
    await this.scheduler.removeMonitorSchedule(monitorId);
  }
}

// Export singleton instance
export const uptimeServiceBullMQ = new UptimeServiceBullMQ();