ALTER TABLE "sites" ADD COLUMN "search_console_access_token" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "search_console_refresh_token" text;--> statement-breakpoint
ALTER TABLE "sites" ADD COLUMN "search_console_token_expiry" timestamp;