import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  foreignKey,
  real,
  check,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { organization, user } from "./schema.js";

// Uptime monitor definitions
export const uptimeMonitors = pgTable(
  "uptime_monitors",
  {
    id: serial("id").primaryKey().notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    name: text("name"),
    monitorType: text("monitor_type").notNull(), // 'http', 'tcp'

    // Common settings
    intervalSeconds: integer("interval_seconds").notNull(),
    enabled: boolean("enabled").default(true),

    // HTTP/HTTPS specific configuration
    httpConfig: jsonb("http_config").$type<{
      url: string;
      method: "GET" | "POST" | "PUT" | "DELETE" | "HEAD" | "OPTIONS" | "PATCH";
      headers?: Record<string, string>;
      body?: string;
      auth?: {
        type: "none" | "basic" | "bearer" | "api_key" | "custom_header";
        credentials?: {
          username?: string;
          password?: string;
          token?: string;
          headerName?: string;
          headerValue?: string;
        };
      };
      followRedirects?: boolean;
      timeoutMs?: number;
      ipVersion?: "any" | "ipv4" | "ipv6";
      userAgent?: string;
    }>(),

    // TCP specific configuration
    tcpConfig: jsonb("tcp_config").$type<{
      host: string;
      port: number;
      timeoutMs?: number;
    }>(),

    // Validation rules
    validationRules: jsonb("validation_rules").notNull().default([]).$type<
      Array<
        | {
            type: "status_code";
            operator: "equals" | "not_equals" | "in" | "not_in";
            value: number | number[];
          }
        | {
            type: "response_time";
            operator: "less_than" | "greater_than";
            value: number;
          }
        | {
            type: "response_body_contains" | "response_body_not_contains";
            value: string;
            caseSensitive?: boolean;
          }
        | {
            type: "header_exists";
            header: string;
          }
        | {
            type: "header_value";
            header: string;
            operator: "equals" | "contains";
            value: string;
          }
        | {
            type: "response_size";
            operator: "less_than" | "greater_than";
            value: number;
          }
      >
    >(),

    // Multi-region configuration
    monitoringType: text("monitoring_type").default("local"), // 'local' or 'global'
    selectedRegions: jsonb("selected_regions").default(["local"]).$type<string[]>(),

    // Metadata
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "uptime_monitors_organization_id_organization_id_fk",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "uptime_monitors_created_by_user_id_fk",
    }),
  ]
);

// Monitor status tracking
export const uptimeMonitorStatus = pgTable(
  "uptime_monitor_status",
  {
    monitorId: integer("monitor_id")
      .primaryKey()
      .notNull()
      .references(() => uptimeMonitors.id, { onDelete: "cascade" }),
    lastCheckedAt: timestamp("last_checked_at", { mode: "string" }),
    nextCheckAt: timestamp("next_check_at", { mode: "string" }),
    currentStatus: text("current_status").default("unknown"), // 'up', 'down', 'unknown'
    consecutiveFailures: integer("consecutive_failures").default(0),
    consecutiveSuccesses: integer("consecutive_successes").default(0),
    uptimePercentage24h: real("uptime_percentage_24h"),
    uptimePercentage7d: real("uptime_percentage_7d"),
    uptimePercentage30d: real("uptime_percentage_30d"),
    averageResponseTime24h: real("average_response_time_24h"),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.monitorId],
      foreignColumns: [uptimeMonitors.id],
      name: "uptime_monitor_status_monitor_id_uptime_monitors_id_fk",
    }),
    check("uptime_monitor_status_current_status_check", sql`current_status IN ('up', 'down', 'unknown')`),
    check("uptime_monitor_status_uptime_24h_check", sql`uptime_percentage_24h >= 0 AND uptime_percentage_24h <= 100`),
    check("uptime_monitor_status_uptime_7d_check", sql`uptime_percentage_7d >= 0 AND uptime_percentage_7d <= 100`),
    check("uptime_monitor_status_uptime_30d_check", sql`uptime_percentage_30d >= 0 AND uptime_percentage_30d <= 100`),
    index("uptime_monitor_status_updated_at_idx").on(table.updatedAt),
  ]
);

// Alert configuration (scaffolding)
export const uptimeAlerts = pgTable(
  "uptime_alerts",
  {
    id: serial("id").primaryKey().notNull(),
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => uptimeMonitors.id, { onDelete: "cascade" }),
    alertType: text("alert_type").notNull(), // 'email', 'webhook', 'slack', etc.
    alertConfig: jsonb("alert_config").notNull(), // Type-specific configuration
    conditions: jsonb("conditions").notNull().$type<{
      consecutiveFailures?: number;
      responseTimeThresholdMs?: number;
      uptimePercentageThreshold?: number;
    }>(),
    enabled: boolean("enabled").default(true),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.monitorId],
      foreignColumns: [uptimeMonitors.id],
      name: "uptime_alerts_monitor_id_uptime_monitors_id_fk",
    }),
  ]
);

// Alert history (scaffolding)
export const uptimeAlertHistory = pgTable(
  "uptime_alert_history",
  {
    id: serial("id").primaryKey().notNull(),
    alertId: integer("alert_id")
      .notNull()
      .references(() => uptimeAlerts.id, { onDelete: "cascade" }),
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => uptimeMonitors.id, { onDelete: "cascade" }),
    triggeredAt: timestamp("triggered_at", { mode: "string" }).defaultNow(),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),
    alertData: jsonb("alert_data"), // Context about what triggered the alert
  },
  table => [
    foreignKey({
      columns: [table.alertId],
      foreignColumns: [uptimeAlerts.id],
      name: "uptime_alert_history_alert_id_uptime_alerts_id_fk",
    }),
    foreignKey({
      columns: [table.monitorId],
      foreignColumns: [uptimeMonitors.id],
      name: "uptime_alert_history_monitor_id_uptime_monitors_id_fk",
    }),
  ]
);

// Agent regions for VPS-based monitoring
export const agentRegions = pgTable("agent_regions", {
  code: text("code").primaryKey().notNull(), // Region code (e.g., 'us-east', 'europe')
  name: text("name").notNull(), // Region display name
  endpointUrl: text("endpoint_url").notNull(), // Agent endpoint URL
  enabled: boolean("enabled").default(true),
  lastHealthCheck: timestamp("last_health_check", { mode: "string" }),
  isHealthy: boolean("is_healthy").default(true),
});

// Uptime incidents table
export const uptimeIncidents = pgTable(
  "uptime_incidents",
  {
    id: serial("id").primaryKey().notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    monitorId: integer("monitor_id")
      .notNull()
      .references(() => uptimeMonitors.id, { onDelete: "cascade" }),
    region: text("region"), // Region where incident occurred

    // Incident timing
    startTime: timestamp("start_time", { mode: "string" }).notNull(),
    endTime: timestamp("end_time", { mode: "string" }), // null if ongoing

    // Status
    status: text("status").notNull().default("active"), // 'active', 'acknowledged', 'resolved'

    // Acknowledgement details
    acknowledgedBy: text("acknowledged_by").references(() => user.id),
    acknowledgedAt: timestamp("acknowledged_at", { mode: "string" }),

    // Resolution details
    resolvedBy: text("resolved_by").references(() => user.id),
    resolvedAt: timestamp("resolved_at", { mode: "string" }),

    // Error details
    lastError: text("last_error"),
    lastErrorType: text("last_error_type"),
    failureCount: integer("failure_count").default(1),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "uptime_incidents_organization_id_organization_id_fk",
    }),
    foreignKey({
      columns: [table.monitorId],
      foreignColumns: [uptimeMonitors.id],
      name: "uptime_incidents_monitor_id_uptime_monitors_id_fk",
    }),
    foreignKey({
      columns: [table.acknowledgedBy],
      foreignColumns: [user.id],
      name: "uptime_incidents_acknowledged_by_user_id_fk",
    }),
    foreignKey({
      columns: [table.resolvedBy],
      foreignColumns: [user.id],
      name: "uptime_incidents_resolved_by_user_id_fk",
    }),
  ]
);

// Notification channels table
export const notificationChannels = pgTable(
  "notification_channels",
  {
    id: serial("id").primaryKey().notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    type: text("type").notNull(), // 'email', 'discord', 'slack', 'sms'
    name: text("name").notNull(),
    enabled: boolean("enabled").default(true),

    // Channel-specific configuration
    config: jsonb("config").notNull().$type<{
      // Email config
      email?: string;

      // Discord config
      webhookUrl?: string;

      // Slack config
      slackWebhookUrl?: string;
      slackChannel?: string;

      // SMS config (placeholder)
      phoneNumber?: string;
      provider?: string;
    }>(),

    // Monitor selection and notification settings
    monitorIds: jsonb("monitor_ids").$type<number[] | null>(), // null = all monitors
    triggerEvents: jsonb("trigger_events").notNull().default(["down", "recovery"]).$type<string[]>(), // 'down', 'recovery', 'degraded'
    cooldownMinutes: integer("cooldown_minutes").default(5), // Minimum time between notifications
    lastNotifiedAt: timestamp("last_notified_at", { mode: "string" }),

    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
  },
  table => [
    foreignKey({
      columns: [table.organizationId],
      foreignColumns: [organization.id],
      name: "notification_channels_organization_id_organization_id_fk",
    }),
    foreignKey({
      columns: [table.createdBy],
      foreignColumns: [user.id],
      name: "notification_channels_created_by_user_id_fk",
    }),
  ]
);
