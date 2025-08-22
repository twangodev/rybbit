import { relations } from "drizzle-orm/relations";
import { user, invitation, organization, sites, member, session, account, funnels, goals, uptimeMonitors, uptimeAlerts, uptimeAlertHistory, uptimeMonitorStatus, notificationChannels, uptimeIncidents } from "./schema";

export const invitationRelations = relations(invitation, ({one}) => ({
	user: one(user, {
		fields: [invitation.inviterId],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [invitation.organizationId],
		references: [organization.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	invitations: many(invitation),
	sites: many(sites),
	members: many(member),
	sessions: many(session),
	accounts: many(account),
	funnels: many(funnels),
	uptimeMonitors: many(uptimeMonitors),
	notificationChannels: many(notificationChannels),
	uptimeIncidents_acknowledgedBy: many(uptimeIncidents, {
		relationName: "uptimeIncidents_acknowledgedBy_user_id"
	}),
	uptimeIncidents_resolvedBy: many(uptimeIncidents, {
		relationName: "uptimeIncidents_resolvedBy_user_id"
	}),
}));

export const organizationRelations = relations(organization, ({many}) => ({
	invitations: many(invitation),
	sites: many(sites),
	members: many(member),
	uptimeMonitors: many(uptimeMonitors),
	notificationChannels: many(notificationChannels),
	uptimeIncidents: many(uptimeIncidents),
}));

export const sitesRelations = relations(sites, ({one, many}) => ({
	user: one(user, {
		fields: [sites.createdBy],
		references: [user.id]
	}),
	organization: one(organization, {
		fields: [sites.organizationId],
		references: [organization.id]
	}),
	funnels: many(funnels),
	goals: many(goals),
}));

export const memberRelations = relations(member, ({one}) => ({
	organization: one(organization, {
		fields: [member.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [member.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const funnelsRelations = relations(funnels, ({one}) => ({
	site: one(sites, {
		fields: [funnels.siteId],
		references: [sites.siteId]
	}),
	user: one(user, {
		fields: [funnels.userId],
		references: [user.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	site: one(sites, {
		fields: [goals.siteId],
		references: [sites.siteId]
	}),
}));

export const uptimeAlertsRelations = relations(uptimeAlerts, ({one, many}) => ({
	uptimeMonitor: one(uptimeMonitors, {
		fields: [uptimeAlerts.monitorId],
		references: [uptimeMonitors.id]
	}),
	uptimeAlertHistories: many(uptimeAlertHistory),
}));

export const uptimeMonitorsRelations = relations(uptimeMonitors, ({one, many}) => ({
	uptimeAlerts: many(uptimeAlerts),
	uptimeAlertHistories: many(uptimeAlertHistory),
	organization: one(organization, {
		fields: [uptimeMonitors.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [uptimeMonitors.createdBy],
		references: [user.id]
	}),
	uptimeMonitorStatuses: many(uptimeMonitorStatus),
	uptimeIncidents: many(uptimeIncidents),
}));

export const uptimeAlertHistoryRelations = relations(uptimeAlertHistory, ({one}) => ({
	uptimeAlert: one(uptimeAlerts, {
		fields: [uptimeAlertHistory.alertId],
		references: [uptimeAlerts.id]
	}),
	uptimeMonitor: one(uptimeMonitors, {
		fields: [uptimeAlertHistory.monitorId],
		references: [uptimeMonitors.id]
	}),
}));

export const uptimeMonitorStatusRelations = relations(uptimeMonitorStatus, ({one}) => ({
	uptimeMonitor: one(uptimeMonitors, {
		fields: [uptimeMonitorStatus.monitorId],
		references: [uptimeMonitors.id]
	}),
}));

export const notificationChannelsRelations = relations(notificationChannels, ({one}) => ({
	organization: one(organization, {
		fields: [notificationChannels.organizationId],
		references: [organization.id]
	}),
	user: one(user, {
		fields: [notificationChannels.createdBy],
		references: [user.id]
	}),
}));

export const uptimeIncidentsRelations = relations(uptimeIncidents, ({one}) => ({
	organization: one(organization, {
		fields: [uptimeIncidents.organizationId],
		references: [organization.id]
	}),
	uptimeMonitor: one(uptimeMonitors, {
		fields: [uptimeIncidents.monitorId],
		references: [uptimeMonitors.id]
	}),
	user_acknowledgedBy: one(user, {
		fields: [uptimeIncidents.acknowledgedBy],
		references: [user.id],
		relationName: "uptimeIncidents_acknowledgedBy_user_id"
	}),
	user_resolvedBy: one(user, {
		fields: [uptimeIncidents.resolvedBy],
		references: [user.id],
		relationName: "uptimeIncidents_resolvedBy_user_id"
	}),
}));