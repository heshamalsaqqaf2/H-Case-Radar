// import { type InferSelectModel, relations } from "drizzle-orm";
// import {
//   boolean,
//   index,
//   jsonb,
//   pgTable,
//   primaryKey,
//   text,
//   timestamp,
//   uuid,
//   varchar,
// } from "drizzle-orm/pg-core";

// // TODO: جداول من Better Auth
// export const user = pgTable("user", {
//   id: text("id").primaryKey(),
//   name: text("name").notNull(),
//   email: text("email").notNull().unique(),
//   personalEmail: text("personal_email").notNull().unique().default("admin@h-case-radar.com"),
//   emailVerified: boolean("email_verified").default(false).notNull(),
//   image: text("image"),
//   accountStatus: text("account_status").default("pending").notNull(),

//   banned: boolean("banned").default(false),
//   banReason: text("ban_reason"),
//   banExpires: timestamp("ban_expires"),
//   lastLoginAt: timestamp("last_login_at"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at")
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   role_better_auth: text("role_better_auth").default("null"),
// });
// export const session = pgTable("session", {
//   id: text("id").primaryKey(),
//   expiresAt: timestamp("expires_at").notNull(),
//   token: text("token").notNull().unique(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at")
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   ipAddress: text("ip_address"),
//   userAgent: text("user_agent"),
//   userId: text("user_id")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
//   impersonatedBy: text("impersonated_by"),
// });
// export const account = pgTable("account", {
//   id: text("id").primaryKey(),
//   accountId: text("account_id").notNull(),
//   providerId: text("provider_id").notNull(),
//   userId: text("user_id")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
//   accessToken: text("access_token"),
//   refreshToken: text("refresh_token"),
//   idToken: text("id_token"),
//   accessTokenExpiresAt: timestamp("access_token_expires_at"),
//   refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
//   scope: text("scope"),
//   password: text("password"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at")
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
// });
// export const verification = pgTable("verification", {
//   id: text("id").primaryKey(),
//   identifier: text("identifier").notNull(),
//   value: text("value").notNull(),
//   expiresAt: timestamp("expires_at").notNull(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at")
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
// });

// //  Todo: نظام الأدوار والصلاحيات (منفصل تمامًا  Better Auth عن )
// export const permission = pgTable("permission", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: text("name").notNull().unique(),
//   description: text("description"),
//   resource: text("resource").notNull(), // e.g., "user", "post", "settings"
//   action: text("action").notNull(), // e.g., "create", "read", "update", "delete"
//   conditions: jsonb("conditions"), // للـ ABAC
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });
// export const role = pgTable("role", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: text("name").notNull().unique(),
//   description: text("description"),
//   isDefault: boolean("is_default").default(false),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });
// export const rolePermissions = pgTable(
//   "role_permissions",
//   {
//     roleId: uuid("role_id")
//       .notNull()
//       .references(() => role.id, { onDelete: "cascade" }),
//     permissionId: uuid("permission_id")
//       .notNull()
//       .references(() => permission.id, { onDelete: "cascade" }),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
//     roleIdx: index("role_permissions_role_idx").on(table.roleId),
//     permissionIdx: index("role_permissions_permission_idx").on(table.permissionId),
//   }),
// );
// export const userRoles = pgTable(
//   "user_roles",
//   {
//     userId: text("user_id")
//       .notNull()
//       .references(() => user.id, { onDelete: "cascade" }),
//     roleId: uuid("role_id")
//       .notNull()
//       .references(() => role.id, { onDelete: "cascade" }),
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//   },
//   (table) => ({
//     pk: primaryKey({ columns: [table.userId, table.roleId] }),
//     userIdx: index("user_roles_user_idx").on(table.userId),
//     roleIdx: index("user_roles_role_idx").on(table.roleId),
//   }),
// );
// export const auditLog = pgTable(
//   "audit_log",
//   {
//     id: uuid("id").primaryKey().defaultRandom(),
//     userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
//     sessionId: varchar("session_id", { length: 255 }),
//     // Core audit data
//     action: varchar("action", { length: 100 }).notNull(),
//     entity: varchar("entity", { length: 100 }).notNull(),
//     entityId: varchar("entity_id", { length: 100 }).notNull(),
//     // Extended context
//     resourceType: varchar("resource_type", { length: 100 }),
//     resourceId: varchar("resource_id", { length: 100 }),
//     description: text("description"),
//     // Security context
//     ipAddress: varchar("ip_address", { length: 45 }), // IPv6 support
//     userAgent: text("user_agent"),
//     country: varchar("country", { length: 2 }),
//     city: varchar("city", { length: 100 }),
//     // Technical details
//     details: jsonb("details"),
//     status: varchar("status", { length: 20 }).default("success"), // success, failure, warning
//     severity: varchar("severity", { length: 20 }).default("info"), // info, low, medium, high, critical
//     // Timestamps
//     createdAt: timestamp("created_at").defaultNow().notNull(),
//     expiresAt: timestamp("expires_at"), // For automatic cleanup
//   },
//   (table) => ({
//     // Performance indexes
//     userIdIdx: index("audit_log_user_id_idx").on(table.userId),
//     actionIdx: index("audit_log_action_idx").on(table.action),
//     entityIdx: index("audit_log_entity_idx").on(table.entity),
//     entityIdIdx: index("audit_log_entity_id_idx").on(table.entityId),
//     createdAtIdx: index("audit_log_created_at_idx").on(table.createdAt),
//     compositeIdx: index("audit_log_composite_idx").on(table.entity, table.action, table.createdAt),
//   }),
// );

// // TODO: العلاقات Relations
// export const userRelations = relations(user, ({ many }) => ({
//   userRoles: many(userRoles),
// }));
// export const roleRelations = relations(role, ({ many }) => ({
//   userRoles: many(userRoles),
//   rolePermissions: many(rolePermissions),
// }));
// export const permissionRelations = relations(permission, ({ many }) => ({
//   rolePermissions: many(rolePermissions),
// }));
// export const userRolesRelations = relations(userRoles, ({ one }) => ({
//   user: one(user, {
//     fields: [userRoles.userId],
//     references: [user.id],
//   }),
//   role: one(role, {
//     fields: [userRoles.roleId],
//     references: [role.id],
//   }),
// }));
// export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
//   role: one(role, {
//     fields: [rolePermissions.roleId],
//     references: [role.id],
//   }),
//   permission: one(permission, {
//     fields: [rolePermissions.permissionId],
//     references: [permission.id],
//   }),
// }));
// export const auditLogRelations = relations(auditLog, ({ one }) => ({
//   user: one(user, {
//     fields: [auditLog.userId],
//     references: [user.id],
//   }),
// }));

// // export const complaints = pgTable("complaints", {
// //   id: uuid("id").defaultRandom().primaryKey(),
// //   title: text("title").notNull(),
// //   description: text("description").notNull(),
// //   status: text("status").notNull().default("open"),
// //   priority: text("priority").notNull().default("medium"),
// //   category: text("category").notNull(),
// //   assignedTo: uuid("assigned_to"),
// //   submittedBy: uuid("submitted_by").notNull(),
// //   resolutionNotes: text("resolution_notes"),
// //   resolvedAt: timestamp("resolved_at", { mode: "utc" }),
// //   resolvedBy: uuid("resolved_by"),
// //   closedAt: timestamp("closed_at", { mode: "utc" }),
// //   closedBy: uuid("closed_by"),
// //   lastActivityAt: timestamp("last_activity_at", { mode: "utc" }).notNull().defaultNow(),
// //   source: text("source").notNull().default("web_form"),
// //   escalationLevel: text("escalation_level").notNull().default("none"),
// //   satisfactionRating: text("satisfaction_rating"),
// //   responseDueAt: timestamp("response_due_at", { mode: "utc" }),
// //   createdAt: timestamp("created_at", { mode: "utc" }).notNull().defaultNow(),
// //   updatedAt: timestamp("updated_at", { mode: "utc" }).notNull().defaultNow(),
// //   isActive: boolean("is_active").notNull().default(true),
// //   isArchived: boolean("is_archived").notNull().default(false),
// //   archivedAt: timestamp("archived_at", { mode: "utc" }),
// //   archivedBy: uuid("archived_by"),
// // });

// // TODO: الانواع Types
// export type User = InferSelectModel<typeof user>;
// export type Role = InferSelectModel<typeof role>;
// export type Permission = InferSelectModel<typeof permission>;
// export type UserRole = InferSelectModel<typeof userRoles>;
// export type RolePermission = InferSelectModel<typeof rolePermissions>;
// export type AuditLog = typeof auditLog.$inferSelect;
// export type NewAuditLog = typeof auditLog.$inferInsert;

// export const schema = {
//   user,
//   session,
//   account,
//   verification,
//   role,
//   userRoles,
//   permission,
//   rolePermissions,
//   auditLog,
//   auditLogRelations,
// };

// // جدول الشكاوى
// // export const complaint = pgTable(
// //   "complaints",
// //   {
// //     id: uuid("id").primaryKey().defaultRandom(),
// //     title: text("title").notNull(),
// //     description: text("description").notNull(),
// //     status: text("status").notNull().default("open"),
// //     priority: text("priority").notNull().default("medium"),
// //     category: text("category").notNull(),
// //     assignedTo: uuid("assigned_to").references(() => user.id, { onDelete: "set null" }),
// //     submittedBy: uuid("submitted_by")
// //       .notNull()
// //       .references(() => user.id, { onDelete: "cascade" }),
// //     resolutionNotes: text("resolution_notes"),
// //     resolvedAt: timestamp("resolved_at", { withTimezone: true }),
// //     resolvedBy: uuid("resolved_by").references(() => user.id, { onDelete: "set null" }),
// //     closedAt: timestamp("closed_at", { withTimezone: true }),
// //     closedBy: uuid("closed_by").references(() => user.id, { onDelete: "set null" }),
// //     lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(),
// //     source: text("source").notNull().default("web_form"),
// //     escalationLevel: text("escalation_level").notNull().default("none"),
// //     satisfactionRating: text("satisfaction_rating"),
// //     responseDueAt: timestamp("response_due_at", { withTimezone: true }),
// //     createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// //     updatedAt: timestamp("updated_at", { withTimezone: true })
// //       .notNull()
// //       .defaultNow()
// //       .$onUpdate(() => new Date()),
// //     isActive: boolean("is_active").notNull().default(true),
// //     isArchived: boolean("is_archived").notNull().default(false),
// //     archivedAt: timestamp("archived_at", { withTimezone: true }),
// //     archivedBy: uuid("archived_by").references(() => user.id, { onDelete: "set null" }),
// //   },
// //   (table) => ({
// //     statusIdx: index("complaints_status_idx").on(table.status),
// //     priorityIdx: index("complaints_priority_idx").on(table.priority),
// //     assignedToIdx: index("complaints_assigned_to_idx").on(table.assignedTo),
// //     submittedByIdx: index("complaints_submitted_by_idx").on(table.submittedBy),
// //     createdAtIdx: index("complaints_created_at_idx").on(table.createdAt),
// //     lastActivityAtIdx: index("complaints_last_activity_idx").on(table.lastActivityAt),
// //     categoryIdx: index("complaints_category_idx").on(table.category),
// //   }),
// // );

// // // جدول العلامات
// // export const tag = pgTable(
// //   "tags",
// //   {
// //     id: uuid("id").primaryKey().defaultRandom(),
// //     name: text("name").notNull().unique(),
// //   },
// //   (table) => ({
// //     nameIdx: index("tags_name_idx").on(table.name),
// //   }),
// // );

// // // جدول العلاقة بين الشكاوى والعلامات (many-to-many)
// // export const complaintTag = pgTable(
// //   "complaint_tags",
// //   {
// //     complaintId: uuid("complaint_id")
// //       .notNull()
// //       .references(() => complaint.id, { onDelete: "cascade" }),
// //     tagId: uuid("tag_id")
// //       .notNull()
// //       .references(() => tag.id, { onDelete: "cascade" }),
// //   },
// //   (table) => ({
// //     pk: primaryKey({ columns: [table.complaintId, table.tagId] }),
// //     complaintIdx: index("complaint_tags_complaint_idx").on(table.complaintId),
// //     tagIdx: index("complaint_tags_tag_idx").on(table.tagId),
// //   }),
// // );

// // // جدول المرفقات
// // export const complaintAttachment = pgTable(
// //   "complaint_attachments",
// //   {
// //     id: uuid("id").primaryKey().defaultRandom(),
// //     complaintId: uuid("complaint_id")
// //       .notNull()
// //       .references(() => complaint.id, { onDelete: "cascade" }),
// //     url: text("url").notNull(),
// //     filename: text("filename"),
// //     size: text("size"), // يمكن تغييره إلى bigint إذا كنت ترغب في حفظ الحجم بالبايت
// //     uploadedBy: uuid("uploaded_by").references(() => user.id, { onDelete: "set null" }),
// //     createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// //   },
// //   (table) => ({
// //     complaintIdx: index("complaint_attachments_complaint_idx").on(table.complaintId),
// //     uploadedByIdx: index("complaint_attachments_uploaded_by_idx").on(table.uploadedBy),
// //   }),
// // );

// // // جدول التعليقات
// // export const complaintComment = pgTable(
// //   "complaint_comments",
// //   {
// //     id: uuid("id").primaryKey().defaultRandom(),
// //     complaintId: uuid("complaint_id")
// //       .notNull()
// //       .references(() => complaint.id, { onDelete: "cascade" }),
// //     authorId: uuid("author_id")
// //       .notNull()
// //       .references(() => user.id, { onDelete: "cascade" }),
// //     body: text("body").notNull(),
// //     createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// //   },
// //   (table) => ({
// //     complaintIdx: index("complaint_comments_complaint_idx").on(table.complaintId),
// //     authorIdx: index("complaint_comments_author_idx").on(table.authorId),
// //   }),
// // );

// // // جدول سجلات النشاط
// // export const complaintActivityLog = pgTable(
// //   "complaint_activity_logs",
// //   {
// //     id: uuid("id").primaryKey().defaultRandom(),
// //     complaintId: uuid("complaint_id")
// //       .notNull()
// //       .references(() => complaint.id, { onDelete: "cascade" }),
// //     actorId: uuid("actor_id").references(() => user.id, { onDelete: "set null" }),
// //     action: text("action").notNull(),
// //     meta: jsonb("meta"),
// //     createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// //   },
// //   (table) => ({
// //     complaintIdx: index("complaint_activity_logs_complaint_idx").on(table.complaintId),
// //     actorIdx: index("complaint_activity_logs_actor_idx").on(table.actorId),
// //     actionIdx: index("complaint_activity_logs_action_idx").on(table.action),
// //   }),
// // );

// // // العلاقات
// // export const complaintRelations = relations(complaint, ({ one, many }) => ({
// //   assignedUser: one(user, {
// //     fields: [complaint.assignedTo],
// //     references: [user.id],
// //   }),
// //   submittedByUser: one(user, {
// //     fields: [complaint.submittedBy],
// //     references: [user.id],
// //   }),
// //   resolvedByUser: one(user, {
// //     fields: [complaint.resolvedBy],
// //     references: [user.id],
// //   }),
// //   closedByUser: one(user, {
// //     fields: [complaint.closedBy],
// //     references: [user.id],
// //   }),
// //   archivedByUser: one(user, {
// //     fields: [complaint.archivedBy],
// //     references: [user.id],
// //   }),
// //   tags: many(complaintTag),
// //   attachments: many(complaintAttachment),
// //   comments: many(complaintComment),
// //   activityLogs: many(complaintActivityLog),
// // }));

// // export const tagRelations = relations(tag, ({ many }) => ({
// //   complaintTags: many(complaintTag),
// // }));

// // export const complaintTagRelations = relations(complaintTag, ({ one }) => ({
// //   complaint: one(complaint, {
// //     fields: [complaintTag.complaintId],
// //     references: [complaint.id],
// //   }),
// //   tag: one(tag, {
// //     fields: [complaintTag.tagId],
// //     references: [tag.id],
// //   }),
// // }));

// // export const complaintAttachmentRelations = relations(complaintAttachment, ({ one }) => ({
// //   complaint: one(complaint, {
// //     fields: [complaintAttachment.complaintId],
// //     references: [complaint.id],
// //   }),
// //   uploadedByUser: one(user, {
// //     fields: [complaintAttachment.uploadedBy],
// //     references: [user.id],
// //   }),
// // }));

// // export const complaintCommentRelations = relations(complaintComment, ({ one }) => ({
// //   complaint: one(complaint, {
// //     fields: [complaintComment.complaintId],
// //     references: [complaint.id],
// //   }),
// //   author: one(user, {
// //     fields: [complaintComment.authorId],
// //     references: [user.id],
// //   }),
// // }));

// // export const complaintActivityLogRelations = relations(complaintActivityLog, ({ one }) => ({
// //   complaint: one(complaint, {
// //     fields: [complaintActivityLog.complaintId],
// //     references: [complaint.id],
// //   }),
// //   actor: one(user, {
// //     fields: [complaintActivityLog.actorId],
// //     references: [user.id],
// //   }),
// // }));
// // // أنواع TypeScript لتمكين التحقق النوعي
// // export type Complaint = InferSelectModel<typeof complaint>;
// // export type Tag = InferSelectModel<typeof tag>;
// // export type ComplaintTag = InferSelectModel<typeof complaintTag>;
// // export type ComplaintAttachment = InferSelectModel<typeof complaintAttachment>;
// // export type ComplaintComment = InferSelectModel<typeof complaintComment>;
// // export type ComplaintActivityLog = InferSelectModel<typeof complaintActivityLog>;
