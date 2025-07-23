import { MonitorScheduler } from './monitorScheduler.js';
import { MonitorExecutor } from './monitorExecutor.js';

export class UptimeService {
  private scheduler: MonitorScheduler;
  private executor: MonitorExecutor;
  private initialized = false;

  constructor() {
    // Build PostgreSQL connection string from environment variables
    const connectionString = this.buildConnectionString();
    
    this.scheduler = new MonitorScheduler(connectionString);
    // Pass the pg-boss instance from scheduler to executor with default concurrency of 10
    this.executor = new MonitorExecutor(this.scheduler.getBoss(), 10);
  }

  private buildConnectionString(): string {
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || '5432';
    const database = process.env.POSTGRES_DB || 'analytics';
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || '';
    
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('Uptime service already initialized');
      return;
    }
    
    try {
      console.log('Initializing uptime monitoring service...');
      
      // Initialize scheduler (creates pg-boss schema, loads and schedules all monitors)
      await this.scheduler.initialize();
      
      // Start executor (begins processing jobs)
      await this.executor.start();
      
      this.initialized = true;
      console.log('Uptime monitoring service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize uptime service:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down uptime monitoring service...');
    
    try {
      // Shutdown executor first (stops processing new jobs)
      await this.executor.shutdown();
      
      // Then shutdown scheduler (stops pg-boss)
      await this.scheduler.shutdown();
      
      this.initialized = false;
      console.log('Uptime monitoring service shut down successfully');
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
export const uptimeService = new UptimeService();