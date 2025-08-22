import { pgTable, foreignKey, text, timestamp, integer, unique, boolean, serial, jsonb, real, index, check } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const invitation = pgTable("invitation", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	inviterId: text().notNull(),
	organizationId: text().notNull(),
	role: text().notNull(),
	status: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.inviterId],
			foreignColumns: [user.id],
			name: "invitation_inviterId_user_id_fk"
		}),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "invitation_organizationId_organization_id_fk"
		}),
]);

export const activeSessions = pgTable("active_sessions", {
	sessionId: text("session_id").primaryKey().notNull(),
	siteId: integer("site_id"),
	userId: text("user_id"),
	startTime: timestamp("start_time", { mode: 'string' }).defaultNow(),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
});

export const organization = pgTable("organization", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	metadata: text(),
	stripeCustomerId: text(),
	monthlyEventCount: integer().default(0),
	overMonthlyLimit: boolean().default(false),
}, (table) => [
	unique("organization_slug_unique").on(table.slug),
]);

export const sites = pgTable("sites", {
	siteId: serial("site_id").primaryKey().notNull(),
	name: text().notNull(),
	domain: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBy: text("created_by").notNull(),
	organizationId: text("organization_id"),
	public: boolean().default(false),
	saltUserIds: boolean().default(false),
	blockBots: boolean().default(true).notNull(),
	apiKey: text("api_key"),
	excludedIps: jsonb("excluded_ips").default([]),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "sites_created_by_user_id_fk"
		}),
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "sites_organization_id_organization_id_fk"
		}),
]);

export const member = pgTable("member", {
	id: text().primaryKey().notNull(),
	organizationId: text().notNull(),
	userId: text().notNull(),
	role: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "member_organizationId_organization_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "member_userId_user_id_fk"
		}),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	impersonatedBy: text(),
	activeOrganizationId: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}),
	unique("session_token_unique").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}),
]);

export const funnels = pgTable("funnels", {
	reportId: serial("report_id").primaryKey().notNull(),
	siteId: integer("site_id"),
	userId: text("user_id"),
	data: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.siteId],
			name: "funnels_site_id_sites_site_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "funnels_user_id_user_id_fk"
		}),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	username: text(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	role: text().default('user').notNull(),
	displayUsername: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp({ mode: 'string' }),
	stripeCustomerId: text(),
	overMonthlyLimit: boolean().default(false),
	monthlyEventCount: integer().default(0),
}, (table) => [
	unique("user_username_unique").on(table.username),
	unique("user_email_unique").on(table.email),
]);

export const goals = pgTable("goals", {
	goalId: serial("goal_id").primaryKey().notNull(),
	siteId: integer("site_id").notNull(),
	name: text(),
	goalType: text("goal_type").notNull(),
	config: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.siteId],
			foreignColumns: [sites.siteId],
			name: "goals_site_id_sites_site_id_fk"
		}),
]);

export const telemetry = pgTable("telemetry", {
	id: serial().primaryKey().notNull(),
	instanceId: text("instance_id").notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	version: text().notNull(),
	tableCounts: jsonb("table_counts").notNull(),
	clickhouseSizeGb: real("clickhouse_size_gb").notNull(),
});

export const uptimeAlerts = pgTable("uptime_alerts", {
	id: serial().primaryKey().notNull(),
	monitorId: integer("monitor_id").notNull(),
	alertType: text("alert_type").notNull(),
	alertConfig: jsonb("alert_config").notNull(),
	conditions: jsonb().notNull(),
	enabled: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.monitorId],
			foreignColumns: [uptimeMonitors.id],
			name: "uptime_alerts_monitor_id_uptime_monitors_id_fk"
		}),
]);

export const uptimeAlertHistory = pgTable("uptime_alert_history", {
	id: serial().primaryKey().notNull(),
	alertId: integer("alert_id").notNull(),
	monitorId: integer("monitor_id").notNull(),
	triggeredAt: timestamp("triggered_at", { mode: 'string' }).defaultNow(),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	alertData: jsonb("alert_data"),
}, (table) => [
	foreignKey({
			columns: [table.alertId],
			foreignColumns: [uptimeAlerts.id],
			name: "uptime_alert_history_alert_id_uptime_alerts_id_fk"
		}),
	foreignKey({
			columns: [table.monitorId],
			foreignColumns: [uptimeMonitors.id],
			name: "uptime_alert_history_monitor_id_uptime_monitors_id_fk"
		}),
]);

export const agentRegions = pgTable("agent_regions", {
	code: text().primaryKey().notNull(),
	name: text().notNull(),
	endpointUrl: text("endpoint_url").notNull(),
	enabled: boolean().default(true),
	lastHealthCheck: timestamp("last_health_check", { mode: 'string' }),
	isHealthy: boolean("is_healthy").default(true),
});

export const uptimeMonitors = pgTable("uptime_monitors", {
	id: serial().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	name: text(),
	monitorType: text("monitor_type").notNull(),
	intervalSeconds: integer("interval_seconds").notNull(),
	enabled: boolean().default(true),
	httpConfig: jsonb("http_config"),
	tcpConfig: jsonb("tcp_config"),
	validationRules: jsonb("validation_rules").default([]).notNull(),
	selectedRegions: jsonb("selected_regions").default(["local"]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBy: text("created_by").notNull(),
	monitoringType: text("monitoring_type").default('local'),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "uptime_monitors_organization_id_organization_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "uptime_monitors_created_by_user_id_fk"
		}),
]);

export const uptimeMonitorStatus = pgTable("uptime_monitor_status", {
	monitorId: integer("monitor_id").primaryKey().notNull(),
	lastCheckedAt: timestamp("last_checked_at", { mode: 'string' }),
	nextCheckAt: timestamp("next_check_at", { mode: 'string' }),
	currentStatus: text("current_status").default('unknown'),
	consecutiveFailures: integer("consecutive_failures").default(0),
	consecutiveSuccesses: integer("consecutive_successes").default(0),
	uptimePercentage24H: real("uptime_percentage_24h"),
	uptimePercentage7D: real("uptime_percentage_7d"),
	uptimePercentage30D: real("uptime_percentage_30d"),
	averageResponseTime24H: real("average_response_time_24h"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("uptime_monitor_status_updated_at_idx").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.monitorId],
			foreignColumns: [uptimeMonitors.id],
			name: "uptime_monitor_status_monitor_id_uptime_monitors_id_fk"
		}),
	check("uptime_monitor_status_current_status_check", sql`current_status = ANY (ARRAY['up'::text, 'down'::text, 'unknown'::text])`),
	check("uptime_monitor_status_uptime_24h_check", sql`(uptime_percentage_24h >= (0)::double precision) AND (uptime_percentage_24h <= (100)::double precision)`),
	check("uptime_monitor_status_uptime_7d_check", sql`(uptime_percentage_7d >= (0)::double precision) AND (uptime_percentage_7d <= (100)::double precision)`),
	check("uptime_monitor_status_uptime_30d_check", sql`(uptime_percentage_30d >= (0)::double precision) AND (uptime_percentage_30d <= (100)::double precision)`),
]);

export const notificationChannels = pgTable("notification_channels", {
	id: serial().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	type: text().notNull(),
	name: text().notNull(),
	enabled: boolean().default(true),
	config: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	createdBy: text("created_by").notNull(),
	monitorIds: jsonb("monitor_ids"),
	triggerEvents: jsonb("trigger_events").default(["down","recovery"]).notNull(),
	cooldownMinutes: integer("cooldown_minutes").default(5),
	lastNotifiedAt: timestamp("last_notified_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "notification_channels_organization_id_organization_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "notification_channels_created_by_user_id_fk"
		}),
]);

export const uptimeIncidents = pgTable("uptime_incidents", {
	id: serial().primaryKey().notNull(),
	organizationId: text("organization_id").notNull(),
	monitorId: integer("monitor_id").notNull(),
	region: text(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	status: text().default('active').notNull(),
	acknowledgedBy: text("acknowledged_by"),
	acknowledgedAt: timestamp("acknowledged_at", { mode: 'string' }),
	resolvedBy: text("resolved_by"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	lastError: text("last_error"),
	lastErrorType: text("last_error_type"),
	failureCount: integer("failure_count").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.organizationId],
			foreignColumns: [organization.id],
			name: "uptime_incidents_organization_id_organization_id_fk"
		}),
	foreignKey({
			columns: [table.monitorId],
			foreignColumns: [uptimeMonitors.id],
			name: "uptime_incidents_monitor_id_uptime_monitors_id_fk"
		}),
	foreignKey({
			columns: [table.acknowledgedBy],
			foreignColumns: [user.id],
			name: "uptime_incidents_acknowledged_by_user_id_fk"
		}),
	foreignKey({
			columns: [table.resolvedBy],
			foreignColumns: [user.id],
			name: "uptime_incidents_resolved_by_user_id_fk"
		}),
]);
