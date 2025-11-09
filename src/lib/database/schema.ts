import { type InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// TODO: جداول من Better Auth
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role_better_auth"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

//  Todo: نظام الأدوار والصلاحيات (منفصل تمامًا  Better Auth عن )
export const permission = pgTable("permission", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  resource: text("resource").notNull(), // e.g., "user", "post", "settings"
  action: text("action").notNull(), // e.g., "create", "read", "update", "delete"
  conditions: jsonb("conditions"), // للـ ABAC
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const role = pgTable("role", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    roleIdx: index("role_permissions_role_idx").on(table.roleId),
    permissionIdx: index("role_permissions_permission_idx").on(table.permissionId),
  }),
);

export const userRoles = pgTable(
  "user_roles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roleId] }),
    userIdx: index("user_roles_user_idx").on(table.userId),
    roleIdx: index("user_roles_role_idx").on(table.roleId),
  }),
);

export const complaint = pgTable(
  "complaint",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", {
      length: 20,
      enum: ["open", "in_progress", "awaiting_response", "resolved", "closed"],
    })
      .notNull()
      .default("open"),
    priority: varchar("priority", {
      length: 10,
      enum: ["low", "medium", "high", "critical"],
    })
      .notNull()
      .default("medium"),
    category: varchar("category", { length: 50 }).notNull(), // مثلاً: "technical", "billing", "support"
    assignedTo: text("assigned_to").references(() => user.id, {
      onDelete: "set null",
    }), // من يعالج الشكوى
    submittedBy: text("submitted_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // من أرسل الشكوى
    attachments: jsonb("attachments"), // مصفوفة من روابط المرفقات
    resolutionNotes: text("resolution_notes"), // ملاحظات عند الحل
    resolvedAt: timestamp("resolved_at"),
    resolvedBy: text("resolved_by").references(() => user.id, {
      onDelete: "set null",
    }), // من حل الشكوى
    closedAt: timestamp("closed_at"), // متى أغلقت نهائياً
    closedBy: text("closed_by").references(() => user.id, {
      onDelete: "set null",
    }), // من أغلق الشكوى
    lastActivityAt: timestamp("last_activity_at").defaultNow().notNull(), // آخر نشاط
    source: varchar("source", {
      length: 20,
      enum: ["web_form", "email", "phone", "mobile_app", "api"],
    })
      .notNull()
      .default("web_form"), // من أين جاءت
    tags: jsonb("tags"), // مصفوفة من الوسوم (مثلاً: ["urgent", "VIP"])
    escalationLevel: varchar("escalation_level", {
      length: 10,
      enum: ["none", "level_1", "level_2", "level_3"],
    })
      .notNull()
      .default("none"), // مستوى التصعيد
    satisfactionRating: varchar("satisfaction_rating", {
      length: 10,
      enum: ["very_dissatisfied", "dissatisfied", "neutral", "satisfied", "very_satisfied"],
    }), // تقييم العميل بعد الحل
    responseDueAt: timestamp("response_due_at"), // موعد الرد المطلوب
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(), // هل الشكوى نشطة؟
    isArchived: boolean("is_archived").default(false).notNull(), // تم الأرشفة؟
    archivedAt: timestamp("archived_at"),
    archivedBy: text("archived_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => ({
    statusIdx: index("complaint_status_idx").on(table.status),
    priorityIdx: index("complaint_priority_idx").on(table.priority),
    assignedToIdx: index("complaint_assigned_to_idx").on(table.assignedTo),
    submittedByIdx: index("complaint_submitted_by_idx").on(table.submittedBy),
    createdAtIdx: index("complaint_created_at_idx").on(table.createdAt),
    lastActivityAtIdx: index("complaint_last_activity_idx").on(table.lastActivityAt),
    categoryIdx: index("complaint_category_idx").on(table.category),
  }),
);

// TODO: العلاقات Relations
export const userRelations = relations(user, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const roleRelations = relations(role, ({ many }) => ({
  userRoles: many(userRoles),
  rolePermissions: many(rolePermissions),
}));

export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermissions),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(user, {
    fields: [userRoles.userId],
    references: [user.id],
  }),
  role: one(role, {
    fields: [userRoles.roleId],
    references: [role.id],
  }),
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(role, {
    fields: [rolePermissions.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [rolePermissions.permissionId],
    references: [permission.id],
  }),
}));

export const complaintRelations = relations(complaint, ({ one }) => ({
  assignedUser: one(user, {
    fields: [complaint.assignedTo],
    references: [user.id],
  }),
  submittedByUser: one(user, {
    fields: [complaint.submittedBy],
    references: [user.id],
  }),
  resolvedByUser: one(user, {
    fields: [complaint.resolvedBy],
    references: [user.id],
  }),
  closedByUser: one(user, {
    fields: [complaint.closedBy],
    references: [user.id],
  }),
  archivedByUser: one(user, {
    fields: [complaint.archivedBy],
    references: [user.id],
  }),
}));

// !: Audit Logs Table
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .default("anonymous")
    .references(() => user.id, { onDelete: "cascade" }), // ربط بالمستخدم
  action: varchar("action", { length: 50 }).notNull(), // مثلاً: "role.create"
  entity: varchar("entity", { length: 50 }).notNull(), // "role", "user", "permission"
  entityId: text("entity_id").notNull(), // معرف الكيان المعدّل
  details: text("details"), // JSON يحتوي على تفاصيل الإجراء
  ipAddress: varchar("ip_address", { length: 45 }), // IPv4 و IPv6
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// !: Audit Logs Relations
export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}));

// TODO: الانواع Types
export type User = InferSelectModel<typeof user>;
export type Role = InferSelectModel<typeof role>;
export type Permission = InferSelectModel<typeof permission>;
export type UserRole = InferSelectModel<typeof userRoles>;
export type RolePermission = InferSelectModel<typeof rolePermissions>;
export type Complaint = InferSelectModel<typeof complaint>;
export type AuditLog = InferSelectModel<typeof auditLog>;

export const schema = {
  user,
  session,
  account,
  verification,
  role,
  userRoles,
  permission,
  rolePermissions,
  complaint,
  complaintRelations,
  auditLog,
  auditLogRelations,
};
