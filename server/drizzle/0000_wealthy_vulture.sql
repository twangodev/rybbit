-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"inviterId" text NOT NULL,
	"organizationId" text NOT NULL,
	"role" text NOT NULL,
	"status" text NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "active_sessions" (
	"session_id" text PRIMARY KEY NOT NULL,
	"site_id" integer,
	"user_id" text,
	"start_time" timestamp DEFAULT now(),
	"last_activity" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"createdAt" timestamp NOT NULL,
	"metadata" text,
	"stripeCustomerId" text,
	"monthlyEventCount" integer DEFAULT 0,
	"overMonthlyLimit" boolean DEFAULT false,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"site_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"domain" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL,
	"organization_id" text,
	"public" boolean DEFAULT false,
	"saltUserIds" boolean DEFAULT false,
	"blockBots" boolean DEFAULT true NOT NULL,
	"api_key" text,
	"excluded_ips" jsonb DEFAULT '[]'::jsonb
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"userId" text NOT NULL,
	"role" text NOT NULL,
	"createdAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" text,
	"activeOrganizationId" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "funnels" (
	"report_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer,
	"user_id" text,
	"data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"displayUsername" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp,
	"stripeCustomerId" text,
	"overMonthlyLimit" boolean DEFAULT false,
	"monthlyEventCount" integer DEFAULT 0,
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"goal_id" serial PRIMARY KEY NOT NULL,
	"site_id" integer NOT NULL,
	"name" text,
	"goal_type" text NOT NULL,
	"config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "telemetry" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_id" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"version" text NOT NULL,
	"table_counts" jsonb NOT NULL,
	"clickhouse_size_gb" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uptime_alerts" (
	"id" serial PRIMARY KEY NOT NULL,
	"monitor_id" integer NOT NULL,
	"alert_type" text NOT NULL,
	"alert_config" jsonb NOT NULL,
	"conditions" jsonb NOT NULL,
	"enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "uptime_alert_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"alert_id" integer NOT NULL,
	"monitor_id" integer NOT NULL,
	"triggered_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"alert_data" jsonb
);
--> statement-breakpoint
CREATE TABLE "agent_regions" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"endpoint_url" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"last_health_check" timestamp,
	"is_healthy" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "uptime_monitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text,
	"monitor_type" text NOT NULL,
	"interval_seconds" integer NOT NULL,
	"enabled" boolean DEFAULT true,
	"http_config" jsonb,
	"tcp_config" jsonb,
	"validation_rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"selected_regions" jsonb DEFAULT '["local"]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL,
	"monitoring_type" text DEFAULT 'local'
);
--> statement-breakpoint
CREATE TABLE "uptime_monitor_status" (
	"monitor_id" integer PRIMARY KEY NOT NULL,
	"last_checked_at" timestamp,
	"next_check_at" timestamp,
	"current_status" text DEFAULT 'unknown',
	"consecutive_failures" integer DEFAULT 0,
	"consecutive_successes" integer DEFAULT 0,
	"uptime_percentage_24h" real,
	"uptime_percentage_7d" real,
	"uptime_percentage_30d" real,
	"average_response_time_24h" real,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "uptime_monitor_status_current_status_check" CHECK (current_status = ANY (ARRAY['up'::text, 'down'::text, 'unknown'::text])),
	CONSTRAINT "uptime_monitor_status_uptime_24h_check" CHECK ((uptime_percentage_24h >= (0)::double precision) AND (uptime_percentage_24h <= (100)::double precision)),
	CONSTRAINT "uptime_monitor_status_uptime_7d_check" CHECK ((uptime_percentage_7d >= (0)::double precision) AND (uptime_percentage_7d <= (100)::double precision)),
	CONSTRAINT "uptime_monitor_status_uptime_30d_check" CHECK ((uptime_percentage_30d >= (0)::double precision) AND (uptime_percentage_30d <= (100)::double precision))
);
--> statement-breakpoint
CREATE TABLE "notification_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"config" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL,
	"monitor_ids" jsonb,
	"trigger_events" jsonb DEFAULT '["down","recovery"]'::jsonb NOT NULL,
	"cooldown_minutes" integer DEFAULT 5,
	"last_notified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "uptime_incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"monitor_id" integer NOT NULL,
	"region" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"acknowledged_by" text,
	"acknowledged_at" timestamp,
	"resolved_by" text,
	"resolved_at" timestamp,
	"last_error" text,
	"last_error_type" text,
	"failure_count" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviterId_user_id_fk" FOREIGN KEY ("inviterId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organizationId_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("site_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_alerts" ADD CONSTRAINT "uptime_alerts_monitor_id_uptime_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."uptime_monitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_alert_history" ADD CONSTRAINT "uptime_alert_history_alert_id_uptime_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."uptime_alerts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_alert_history" ADD CONSTRAINT "uptime_alert_history_monitor_id_uptime_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."uptime_monitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_monitors" ADD CONSTRAINT "uptime_monitors_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_monitors" ADD CONSTRAINT "uptime_monitors_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_monitor_status" ADD CONSTRAINT "uptime_monitor_status_monitor_id_uptime_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."uptime_monitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_channels" ADD CONSTRAINT "notification_channels_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_incidents" ADD CONSTRAINT "uptime_incidents_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_incidents" ADD CONSTRAINT "uptime_incidents_monitor_id_uptime_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."uptime_monitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_incidents" ADD CONSTRAINT "uptime_incidents_acknowledged_by_user_id_fk" FOREIGN KEY ("acknowledged_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uptime_incidents" ADD CONSTRAINT "uptime_incidents_resolved_by_user_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uptime_monitor_status_updated_at_idx" ON "uptime_monitor_status" USING btree ("updated_at" timestamp_ops);
*/