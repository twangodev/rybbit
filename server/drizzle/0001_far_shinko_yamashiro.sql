ALTER TABLE "uptime_monitor_status" DROP CONSTRAINT "uptime_monitor_status_current_status_check";--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" DROP CONSTRAINT "uptime_monitor_status_uptime_24h_check";--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" DROP CONSTRAINT "uptime_monitor_status_uptime_7d_check";--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" DROP CONSTRAINT "uptime_monitor_status_uptime_30d_check";--> statement-breakpoint
DROP INDEX "uptime_monitor_status_updated_at_idx";--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "search_console_api_key" text;--> statement-breakpoint
CREATE INDEX "uptime_monitor_status_updated_at_idx" ON "uptime_monitor_status" USING btree ("updated_at");--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" ADD CONSTRAINT "uptime_monitor_status_current_status_check" CHECK (current_status IN ('up', 'down', 'unknown'));--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" ADD CONSTRAINT "uptime_monitor_status_uptime_24h_check" CHECK (uptime_percentage_24h >= 0 AND uptime_percentage_24h <= 100);--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" ADD CONSTRAINT "uptime_monitor_status_uptime_7d_check" CHECK (uptime_percentage_7d >= 0 AND uptime_percentage_7d <= 100);--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" ADD CONSTRAINT "uptime_monitor_status_uptime_30d_check" CHECK (uptime_percentage_30d >= 0 AND uptime_percentage_30d <= 100);