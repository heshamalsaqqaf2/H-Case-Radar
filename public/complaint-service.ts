// // src/lib/complaints/services/admin/complaint-service.ts
// import { and, eq, ilike, isNotNull, or, sql } from "drizzle-orm";
// import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
// import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
// import type {
//   ComplaintProfileData,
//   ComplaintStats,
//   ComplaintSummary,
//   ComplaintWithUserDetails,
//   CreateComplaintInput,
//   UpdateComplaintInput,
// } from "@/lib/authorization/types/complaint";
// import { complaint, user } from "@/lib/database/schema";
// import { database as db } from "@/lib/database/server";
// import { Errors } from "@/lib/errors/error-factory";

// async function authorize(userId: string, requiredPermission: string) {
//   const check = await authorizationService.checkPermission({ userId }, requiredPermission);
//   if (!check.allowed) {
//     throw Errors.forbidden("إدارة الشكاوى");
//   }
// }

// export async function createComplaint(userId: string, input: CreateComplaintInput) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.CREATE);

//   const [newComplaint] = await db
//     .insert(complaint)
//     .values({
//       ...input,
//       submittedBy: userId,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       lastActivityAt: new Date(),
//       isActive: true,
//       isArchived: false,
//     })
//     .returning();

//   return newComplaint;
// }

// export async function updateComplaint(userId: string, input: UpdateComplaintInput) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE);

//   const [updated] = await db
//     .update(complaint)
//     .set({
//       ...input,
//       updatedAt: new Date(),
//       lastActivityAt: new Date(),
//     })
//     .where(eq(complaint.id, input.id))
//     .returning();

//   if (!updated) throw Errors.notFound("الشكوى");
//   return updated;
// }

// export async function deleteComplaint(userId: string, complaintId: string) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.DELETE);

//   await db.delete(complaint).where(eq(complaint.id, complaintId));
// }

// export async function assignComplaint(userId: string, complaintId: string, assignedTo: string) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN);

//   const [updated] = await db
//     .update(complaint)
//     .set({
//       assignedTo,
//       updatedAt: new Date(),
//       lastActivityAt: new Date(),
//     })
//     .where(eq(complaint.id, complaintId))
//     .returning();

//   if (!updated) throw Errors.notFound("الشكوى");
//   return updated;
// }

// export async function resolveComplaint(userId: string, complaintId: string, resolutionNotes?: string) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE);

//   const [updated] = await db
//     .update(complaint)
//     .set({
//       status: "resolved",
//       resolvedBy: userId,
//       resolvedAt: new Date(),
//       resolutionNotes,
//       updatedAt: new Date(),
//       lastActivityAt: new Date(),
//     })
//     .where(eq(complaint.id, complaintId))
//     .returning();

//   if (!updated) throw Errors.notFound("الشكوى");
//   return updated;
// }

// export async function closeComplaint(userId: string, complaintId: string) {
//   await authorize(userId, AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE);

//   const [updated] = await db
//     .update(complaint)
//     .set({
//       status: "closed",
//       closedBy: userId,
//       closedAt: new Date(),
//       updatedAt: new Date(),
//       lastActivityAt: new Date(),
//     })
//     .where(eq(complaint.id, complaintId))
//     .returning();

//   if (!updated) throw Errors.notFound("الشكوى");
//   return updated;
// }

// export async function getComplaintById(complaintId: string): Promise<ComplaintWithUserDetails | null> {
//   const complaintResult = await db
//     .select({
//       id: complaint.id,
//       title: complaint.title,
//       description: complaint.description,
//       status: complaint.status,
//       priority: complaint.priority,
//       category: complaint.category,
//       assignedTo: complaint.assignedTo,
//       submittedBy: complaint.submittedBy,
//       attachments: complaint.attachments,
//       resolutionNotes: complaint.resolutionNotes,
//       resolvedAt: complaint.resolvedAt,
//       resolvedBy: complaint.resolvedBy,
//       closedAt: complaint.closedAt,
//       closedBy: complaint.closedBy,
//       lastActivityAt: complaint.lastActivityAt,
//       source: complaint.source,
//       tags: complaint.tags,
//       escalationLevel: complaint.escalationLevel,
//       satisfactionRating: complaint.satisfactionRating,
//       responseDueAt: complaint.responseDueAt,
//       createdAt: complaint.createdAt,
//       updatedAt: complaint.updatedAt,
//       isActive: complaint.isActive,
//       isArchived: complaint.isArchived,
//       archivedAt: complaint.archivedAt,
//       archivedBy: complaint.archivedBy,
//     })
//     .from(complaint)
//     .where(eq(complaint.id, complaintId))
//     .limit(1);

//   if (complaintResult.length === 0) return null;

//   const complaintData = complaintResult[0];

//   // جلب بيانات المستخدمين باستخدام استعلام واحد فعال
//   const userIds = [
//     complaintData.submittedBy,
//     complaintData.assignedTo,
//     complaintData.resolvedBy,
//     complaintData.closedBy,
//     complaintData.archivedBy,
//   ].filter((id): id is string => id !== null);

//   if (userIds.length === 0) {
//     return {
//       ...complaintData,
//       attachments: complaintData.attachments as string[] | null,
//       tags: complaintData.tags as string[] | null,
//       assignedUserName: null,
//       assignedUserEmail: null,
//       submittedByUserName: "",
//       submittedByUserEmail: "",
//     };
//   }

//   const users = await db
//     .select({ id: user.id, name: user.name, email: user.email })
//     .from(user)
//     .where(sql`${user.id} = ANY(${userIds})`);

//   const usersMap = new Map(users.map((u) => [u.id, u]));

//   return {
//     ...complaintData,
//     attachments: complaintData.attachments as string[] | null,
//     tags: complaintData.tags as string[] | null,
//     assignedUserName: complaintData.assignedTo ? usersMap.get(complaintData.assignedTo)?.name || null : null,
//     assignedUserEmail: complaintData.assignedTo
//       ? usersMap.get(complaintData.assignedTo)?.email || null
//       : null,
//     submittedByUserName: usersMap.get(complaintData.submittedBy)?.name || "",
//     submittedByUserEmail: usersMap.get(complaintData.submittedBy)?.email || "",
//   };
// }

// export async function getAllComplaints(
//   search?: string,
//   status?: string,
//   priority?: string,
// ): Promise<ComplaintSummary[]> {
//   // نستخدم استعلامًا موحدًا مع AND/OR بدلاً من `.where()` المتسلسل
//   const conditions = [];

//   if (search) {
//     conditions.push(ilike(complaint.title, `%${search}%`));
//   }

//   if (status) {
//     conditions.push(
//       eq(complaint.status, status as "open" | "in_progress" | "awaiting_response" | "resolved" | "closed"),
//     );
//   }

//   if (priority) {
//     conditions.push(eq(complaint.priority, priority as "low" | "medium" | "high" | "critical"));
//   }

//   let query = null;
//   if (conditions.length > 0) {
//     query = db
//       .select({
//         id: complaint.id,
//         title: complaint.title,
//         status: complaint.status,
//         priority: complaint.priority,
//         category: complaint.category,
//         assignedTo: complaint.assignedTo,
//         submittedBy: complaint.submittedBy,
//         createdAt: complaint.createdAt,
//         lastActivityAt: complaint.lastActivityAt,
//       })
//       .from(complaint)
//       .where(and(...conditions))
//       .orderBy(complaint.createdAt);
//   } else {
//     query = db
//       .select({
//         id: complaint.id,
//         title: complaint.title,
//         status: complaint.status,
//         priority: complaint.priority,
//         category: complaint.category,
//         assignedTo: complaint.assignedTo,
//         submittedBy: complaint.submittedBy,
//         createdAt: complaint.createdAt,
//         lastActivityAt: complaint.lastActivityAt,
//       })
//       .from(complaint)
//       .orderBy(complaint.createdAt);
//   }

//   const complaints = await query;

//   // جلب أسماء المستخدمين في استعلام واحد فقط
//   const userIds = [
//     ...new Set(
//       complaints.flatMap((c) => [c.assignedTo, c.submittedBy]).filter((id): id is string => id !== null),
//     ),
//   ];

//   if (userIds.length === 0) {
//     return complaints.map((c) => ({
//       id: c.id,
//       title: c.title,
//       status: c.status,
//       priority: c.priority,
//       category: c.category,
//       assignedTo: c.assignedTo,
//       submittedBy: c.submittedBy,
//       createdAt: c.createdAt,
//       lastActivityAt: c.lastActivityAt,
//       assignedUserName: null,
//       submittedByUserName: "",
//     }));
//   }

//   const users = await db
//     .select({ id: user.id, name: user.name })
//     .from(user)
//     .where(sql`${user.id} = ANY(${userIds})`);

//   const usersMap = new Map(users.map((u) => [u.id, u.name]));

//   return complaints.map((c) => ({
//     id: c.id,
//     title: c.title,
//     status: c.status,
//     priority: c.priority,
//     category: c.category,
//     assignedTo: c.assignedTo,
//     submittedBy: c.submittedBy,
//     createdAt: c.createdAt,
//     lastActivityAt: c.lastActivityAt,
//     assignedUserName: c.assignedTo ? usersMap.get(c.assignedTo) || null : null,
//     submittedByUserName: usersMap.get(c.submittedBy) || "",
//   }));
// }

// export async function getComplaintStats(): Promise<ComplaintStats> {
//   const [total, open, inProgress, resolved, closed, overdue, highPriority] = await Promise.all([
//     db.select({ count: sql<number>`count(*)` }).from(complaint),
//     db.select({ count: sql<number>`count(*)` }).from(complaint).where(eq(complaint.status, "open")),
//     db.select({ count: sql<number>`count(*)` }).from(complaint).where(eq(complaint.status, "in_progress")),
//     db.select({ count: sql<number>`count(*)` }).from(complaint).where(eq(complaint.status, "resolved")),
//     db.select({ count: sql<number>`count(*)` }).from(complaint).where(eq(complaint.status, "closed")),
//     db
//       .select({ count: sql<number>`count(*)` })
//       .from(complaint)
//       .where(
//         and(
//           isNotNull(complaint.responseDueAt),
//           sql`${complaint.responseDueAt} < ${new Date()}`,
//           or(
//             eq(complaint.status, "open"),
//             eq(complaint.status, "in_progress"),
//             eq(complaint.status, "awaiting_response"),
//           ),
//         ),
//       ),
//     db.select({ count: sql<number>`count(*)` }).from(complaint).where(eq(complaint.priority, "high")),
//   ]);

//   const byCategory = await db
//     .select({
//       category: complaint.category,
//       count: sql<number>`count(*)`,
//     })
//     .from(complaint)
//     .groupBy(complaint.category);

//   const byPriority = await db
//     .select({
//       priority: complaint.priority,
//       count: sql<number>`count(*)`,
//     })
//     .from(complaint)
//     .groupBy(complaint.priority);

//   const byStatus = await db
//     .select({
//       status: complaint.status,
//       count: sql<number>`count(*)`,
//     })
//     .from(complaint)
//     .groupBy(complaint.status);

//   return {
//     total: total[0].count,
//     open: open[0].count,
//     inProgress: inProgress[0].count,
//     resolved: resolved[0].count,
//     closed: closed[0].count,
//     overdue: overdue[0].count,
//     highPriority: highPriority[0].count,
//     byCategory: Object.fromEntries(byCategory.map((item) => [item.category, item.count])),
//     byPriority: Object.fromEntries(byPriority.map((item) => [item.priority, item.count])),
//     byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item.count])),
//   };
// }

// export async function getComplaintProfileData(complaintId: string): Promise<ComplaintProfileData | null> {
//   const complaintData = await getComplaintById(complaintId);
//   if (!complaintData) return null;

//   const statistics = {
//     totalComments: 0, // سيتم تطويره لاحقاً مع جدول التعليقات
//     responseTime: 0, // hours
//     resolutionTime: 0, // hours
//   };

//   const activity: Array<{
//     id: string;
//     action: string;
//     description: string;
//     timestamp: Date;
//     type: "view" | "update" | "assign" | "resolve" | "close";
//   }> = [
//     {
//       id: "1",
//       action: "Complaint Created",
//       description: "تم إنشاء شكوى جديدة",
//       timestamp: complaintData.createdAt,
//       type: "update",
//     },
//     {
//       id: "2",
//       action: "Complaint Viewed",
//       description: "تم عرض تفاصيل الشكوى",
//       timestamp: new Date(),
//       type: "view",
//     },
//   ];

//   return {
//     complaint: complaintData,
//     statistics,
//     activity,
//   };
// }
