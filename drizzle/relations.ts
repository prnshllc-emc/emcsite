import { relations } from "drizzle-orm";
import {
  users,
  customers,
  vehicles,
  billsOfLading,
  trackingCodes,
  trackingHistory,
  clicksignContracts,
  processedEmails,
  clientInvites,
  clientDocuments,
  auditLog,
  systemConfig,
} from "./schema";

// ── Users relations ──────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  auditLogs: many(auditLog),
  invitesSent: many(clientInvites),
}));

// ── Customers relations ──────────────────────────────────────
export const customersRelations = relations(customers, ({ many }) => ({
  vehicles: many(vehicles),
  billsOfLading: many(billsOfLading),
  trackingCodes: many(trackingCodes),
  clicksignContracts: many(clicksignContracts),
  invites: many(clientInvites),
}));

// ── Vehicles relations ───────────────────────────────────────
export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  customer: one(customers, {
    fields: [vehicles.customerId],
    references: [customers.id],
  }),
  billsOfLading: many(billsOfLading),
  clicksignContracts: many(clicksignContracts),
}));

// ── Bills of Lading relations ────────────────────────────────
export const billsOfLadingRelations = relations(billsOfLading, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [billsOfLading.vehicleId],
    references: [vehicles.id],
  }),
  customer: one(customers, {
    fields: [billsOfLading.customerId],
    references: [customers.id],
  }),
  trackingCodes: many(trackingCodes),
  trackingHistory: many(trackingHistory),
  processedEmails: many(processedEmails),
}));

// ── Tracking Codes relations ─────────────────────────────────
export const trackingCodesRelations = relations(trackingCodes, ({ one }) => ({
  billOfLading: one(billsOfLading, {
    fields: [trackingCodes.blId],
    references: [billsOfLading.id],
  }),
  customer: one(customers, {
    fields: [trackingCodes.customerId],
    references: [customers.id],
  }),
}));

// ── Tracking History relations ───────────────────────────────
export const trackingHistoryRelations = relations(trackingHistory, ({ one }) => ({
  billOfLading: one(billsOfLading, {
    fields: [trackingHistory.blId],
    references: [billsOfLading.id],
  }),
}));

// ── ClickSign Contracts relations ────────────────────────────
export const clicksignContractsRelations = relations(clicksignContracts, ({ one }) => ({
  customer: one(customers, {
    fields: [clicksignContracts.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [clicksignContracts.vehicleId],
    references: [vehicles.id],
  }),
}));

// ── Processed Emails relations ───────────────────────────────
export const processedEmailsRelations = relations(processedEmails, ({ one }) => ({
  billOfLading: one(billsOfLading, {
    fields: [processedEmails.blId],
    references: [billsOfLading.id],
  }),
}));

// ── Client Invites relations ─────────────────────────────────
export const clientInvitesRelations = relations(clientInvites, ({ one, many }) => ({
  customer: one(customers, {
    fields: [clientInvites.customerId],
    references: [customers.id],
  }),
  vehicle: one(vehicles, {
    fields: [clientInvites.vehicleId],
    references: [vehicles.id],
  }),
  invitedByUser: one(users, {
    fields: [clientInvites.invitedBy],
    references: [users.id],
  }),
  documents: many(clientDocuments),
}));

// ── Client Documents relations ───────────────────────────────
export const clientDocumentsRelations = relations(clientDocuments, ({ one }) => ({
  invite: one(clientInvites, {
    fields: [clientDocuments.inviteId],
    references: [clientInvites.id],
  }),
}));

// ── Audit Log relations ──────────────────────────────────────
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

// ── System Config relations ──────────────────────────────────
export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemConfig.updatedBy],
    references: [users.id],
  }),
}));
