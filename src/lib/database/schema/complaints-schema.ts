import { type InferSelectModel, relations } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Table
export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("open"), // ✅ الافتراضي open
  priority: text("priority").notNull().default("medium"),
  category: text("category").notNull(),
  assignedTo: text("assigned_to").notNull(), // ✅ مطلوب - لا يمكن أن يكون null
  submittedBy: text("submitted_by").notNull(),
  resolutionNotes: text("resolution_notes"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }), // ✅ بدون افتراضي
  resolvedBy: text("resolved_by"),
  closedAt: timestamp("closed_at", { withTimezone: true }), // ✅ بدون افتراضي
  closedBy: text("closed_by"),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }).notNull().defaultNow(), // ✅ منطقي
  source: text("source").notNull().default("web_form"),
  escalationLevel: text("escalation_level").notNull().default("none"),
  satisfactionRating: text("satisfaction_rating"),
  responseDueAt: timestamp("response_due_at", { withTimezone: true }), // ✅ بدون افتراضي
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
  isArchived: boolean("is_archived").notNull().default(false),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  archivedBy: text("archived_by"),
  // ✅ إضافات جديدة
  isUrgent: boolean("is_urgent").notNull().default(false),
  expectedResolutionDate: timestamp("expected_resolution_date", { withTimezone: true }),
  actualResolutionTime: integer("actual_resolution_time"), // بالساعات
  isReopened: boolean("is_reopened").notNull().default(false),
  reopenCount: integer("reopen_count").notNull().default(0),
  reopenReason: text("reopen_reason"),
});

export const complaintActivityLogs = pgTable("complaint_activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  complaintId: uuid("complaint_id").notNull(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const complaintAttachments = pgTable("complaint_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  complaintId: uuid("complaint_id").notNull(),
  url: text("url").notNull(),
  filename: text("filename"),
  size: integer("size"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const complaintComments = pgTable("complaint_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  complaintId: uuid("complaint_id").notNull(),
  authorId: text("author_id").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
});

export const complaintTags = pgTable("complaint_tags", {
  complaintId: uuid("complaint_id")
    .references(() => complaints.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
});

// Relations
export const complaintRelations = relations(complaints, ({ one, many }) => ({
  assignedUser: one(user, {
    fields: [complaints.assignedTo],
    references: [user.id],
  }),
  submittedByUser: one(user, {
    fields: [complaints.submittedBy],
    references: [user.id],
  }),
  resolvedByUser: one(user, {
    fields: [complaints.resolvedBy],
    references: [user.id],
  }),
  closedByUser: one(user, {
    fields: [complaints.closedBy],
    references: [user.id],
  }),
  archivedByUser: one(user, {
    fields: [complaints.archivedBy],
    references: [user.id],
  }),
  tags: many(complaintTags),
  attachments: many(complaintAttachments),
  comments: many(complaintComments),
  activityLogs: many(complaintActivityLogs),
}));

export const complaintAttachmentRelations = relations(complaintAttachments, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintAttachments.complaintId],
    references: [complaints.id],
  }),
  uploadedByUser: one(user, {
    fields: [complaintAttachments.uploadedBy],
    references: [user.id],
  }),
}));

export const complaintCommentRelations = relations(complaintComments, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintComments.complaintId],
    references: [complaints.id],
  }),
  author: one(user, {
    fields: [complaintComments.authorId],
    references: [user.id],
  }),
}));

export const complaintActivityLogRelations = relations(complaintActivityLogs, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintActivityLogs.complaintId],
    references: [complaints.id],
  }),
  actor: one(user, {
    fields: [complaintActivityLogs.actorId],
    references: [user.id],
  }),
}));

export const complaintTagRelations = relations(complaintTags, ({ one }) => ({
  complaint: one(complaints, {
    fields: [complaintTags.complaintId],
    references: [complaints.id],
  }),
  tag: one(tags, {
    fields: [complaintTags.tagId],
    references: [tags.id],
  }),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  complaintTags: many(complaintTags),
}));

// Types
export type Complaint = InferSelectModel<typeof complaints>;
export type ComplaintActivityLog = InferSelectModel<typeof complaintActivityLogs>;
export type ComplaintAttachment = InferSelectModel<typeof complaintAttachments>;
export type ComplaintComment = InferSelectModel<typeof complaintComments>;
export type Tag = InferSelectModel<typeof tags>;
export type ComplaintTag = InferSelectModel<typeof complaintTags>;

// // src/lib/database/schema/complaints-schema.ts
// import { type InferSelectModel, relations } from "drizzle-orm";
// import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
// import { user } from "./auth-schema";

// // Table
// export const complaints = pgTable("complaints", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   title: text("title").notNull(),
//   description: text("description").notNull(),
//   status: text("status").notNull().default("open"),
//   priority: text("priority").notNull().default("medium"),
//   category: text("category").notNull(),
//   assignedTo: text("assigned_to"),
//   submittedBy: text("submitted_by").notNull(),
//   resolutionNotes: text("resolution_notes"),
//   resolvedAt: timestamp("resolved_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   resolvedBy: text("resolved_by"),
//   closedAt: timestamp("closed_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   closedBy: text("closed_by"),
//   lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   source: text("source").notNull().default("web_form"),
//   escalationLevel: text("escalation_level").notNull().default("none"),
//   satisfactionRating: text("satisfaction_rating"),
//   responseDueAt: timestamp("response_due_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   createdAt: timestamp("created_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   updatedAt: timestamp("updated_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   isActive: boolean("is_active").notNull().default(true),
//   isArchived: boolean("is_archived").notNull().default(false),
//   archivedAt: timestamp("archived_at", { withTimezone: true })
//     .defaultNow()
//     .$onUpdate(() => /* @__PURE__ */ new Date())
//     .notNull(),
//   archivedBy: text("archived_by"),
// });
// export const complaintActivityLogs = pgTable("complaint_activity_logs", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   complaintId: uuid("complaint_id").notNull(),
//   actorId: text("actor_id"),
//   action: text("action").notNull(),
//   meta: jsonb("meta"),
//   createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// });
// export const complaintAttachments = pgTable("complaint_attachments", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   complaintId: uuid("complaint_id").notNull(),
//   url: text("url").notNull(),
//   filename: text("filename"),
//   size: integer("size"),
//   uploadedBy: text("uploaded_by"),
//   createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// });
// export const complaintComments = pgTable("complaint_comments", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   complaintId: uuid("complaint_id").notNull(),
//   authorId: text("author_id").notNull(),
//   body: text("body").notNull(),
//   createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
// });
// export const tags = pgTable("tags", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   name: text("name").notNull(),
// });
// export const complaintTags = pgTable("complaint_tags", {
//   complaintId: uuid("complaint_id")
//     .references(() => complaints.id)
//     .notNull(),
//   tagId: uuid("tag_id")
//     .references(() => tags.id)
//     .notNull(),
// });

// // Relations
// export const complaintRelations = relations(complaints, ({ one, many }) => ({
//   assignedUser: one(user, {
//     fields: [complaints.assignedTo],
//     references: [user.id],
//   }),
//   submittedByUser: one(user, {
//     fields: [complaints.submittedBy],
//     references: [user.id],
//   }),
//   resolvedByUser: one(user, {
//     fields: [complaints.resolvedBy],
//     references: [user.id],
//   }),
//   closedByUser: one(user, {
//     fields: [complaints.closedBy],
//     references: [user.id],
//   }),
//   archivedByUser: one(user, {
//     fields: [complaints.archivedBy],
//     references: [user.id],
//   }),
//   tags: many(complaintTags),
//   attachments: many(complaintAttachments),
//   comments: many(complaintComments),
//   activityLogs: many(complaintActivityLogs),
// }));
// export const complaintAttachmentRelations = relations(complaintAttachments, ({ one }) => ({
//   complaint: one(complaints, {
//     fields: [complaintAttachments.complaintId],
//     references: [complaints.id],
//   }),
//   uploadedByUser: one(user, {
//     fields: [complaintAttachments.uploadedBy],
//     references: [user.id],
//   }),
// }));
// export const complaintCommentRelations = relations(complaintComments, ({ one }) => ({
//   complaint: one(complaints, {
//     fields: [complaintComments.complaintId],
//     references: [complaints.id],
//   }),
//   author: one(user, {
//     fields: [complaintComments.authorId],
//     references: [user.id],
//   }),
// }));
// export const complaintActivityLogRelations = relations(complaintActivityLogs, ({ one }) => ({
//   complaint: one(complaints, {
//     fields: [complaintActivityLogs.complaintId],
//     references: [complaints.id],
//   }),
//   actor: one(user, {
//     fields: [complaintActivityLogs.actorId],
//     references: [user.id],
//   }),
// }));
// export const complaintTagRelations = relations(complaintTags, ({ one }) => ({
//   complaint: one(complaints, {
//     fields: [complaintTags.complaintId],
//     references: [complaints.id],
//   }),
//   tag: one(tags, {
//     fields: [complaintTags.tagId],
//     references: [tags.id],
//   }),
// }));
// export const tagRelations = relations(tags, ({ many }) => ({
//   complaintTags: many(complaintTags),
// }));

// // Types
// export type Complaint = InferSelectModel<typeof complaints>;
// export type ComplaintActivityLog = InferSelectModel<typeof complaintActivityLogs>;
// export type ComplaintAttachment = InferSelectModel<typeof complaintAttachments>;
// export type ComplaintComment = InferSelectModel<typeof complaintComments>;
// export type Tag = InferSelectModel<typeof tags>;
// export type ComplaintTag = InferSelectModel<typeof complaintTags>;
