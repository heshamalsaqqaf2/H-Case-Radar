/** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */

import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { ComplaintsRepo } from "@/lib/complaints/repositories/complaints-repo";
import {
  ComplaintStatus,
  type ComplaintStatusType,
  canTransition,
  isClosed,
  isFinalStatus,
} from "@/lib/complaints/state/complaint-status";
import type {
  ComplaintEscalationLevel,
  ComplaintProfileData,
  ComplaintStats,
  ComplaintSummary,
  ComplaintWithUserDetails,
  CreateComplaintInput,
  UpdateComplaintInput,
} from "@/lib/complaints/types/type-complaints";
import {
  createComplaintSchema,
  updateComplaintSchema,
} from "@/lib/complaints/validators/complaint-validator";
import {
  complaintActivityLogs as activityTable,
  complaintAttachments as attachmentsTable,
  complaintComments as commentsTable,
  complaints as complaintsTable,
  complaintTags as complaintTagsTable,
  tags as tagsTable,
  user as userTable,
} from "@/lib/database/index";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";
import { authorizeComplaints } from "@/lib/shared/functions/authorize-complaints";

/* ---------------------------
   Types & Constants
   --------------------------- */
type ActivityMeta = Record<string, unknown> | null;
type UserInfoMap = Map<string, { name?: string; email?: string }>;

interface _CursorData {
  createdAt: string;
  id: string;
}
interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

/* ---------------------------
   Configuration
   --------------------------- */
const COMPLAINT_CONFIG = {
  DEFAULT_SOURCE: "web_form" as const,
  DEFAULT_ESCALATION_LEVEL: "none" as const,
  PAGE_SIZE: 20,
  BATCH_SIZE: {
    TAGS: 100,
    ATTACHMENTS: 50,
    USERS: 100,
  },
} as const;

/* ---------------------------
   Core Database Operations
   --------------------------- */
class ComplaintRepository {
  static async findById(complaintId: string) {
    return await ComplaintsRepo.findById(complaintId);
  }

  static async findByIdOrThrow(complaintId: string) {
    const complaint = await ComplaintRepository.findById(complaintId);
    if (!complaint) throw Errors.notFound("الشكوى");
    return complaint;
  }

  static async updateStatus(
    complaintId: string,
    status: ComplaintStatusType,
    additionalFields: Partial<UpdateComplaintInput> = {},
  ) {
    const [updated] = await db
      .update(complaintsTable)
      .set({
        status,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
        ...additionalFields,
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");
    return updated;
  }

  static async bulkGetUserInfo(userIds: string[]) {
    if (userIds.length === 0) return new Map();

    const uniqueIds = [...new Set(userIds)];

    // const user = await db
    //   .select({ id: userTable.id, name: userTable.name, email: userTable.email })
    //   .from(userTable)
    //   .where(
    //     sql`${userTable.id} IN (${sql.join(
    //       uniqueIds.map((id) => sql`${id}`),
    //       ",",
    //     )})`,
    //   );

    const user = await db
      .select({ id: userTable.id, name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(inArray(userTable.id, uniqueIds)); // <-- التغيير هنا

    return new Map(user.map((user) => [user.id, user]));
  }

  static async validateUserExists(userId: string) {
    const [user] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!user) throw Errors.notFound("المستخدم");
    return user;
  }
}

/* ---------------------------
   Tag Management Service
   --------------------------- */

class TagService {
  static async ensureTagsGetIds(tagNames: string[]): Promise<string[]> {
    if (!tagNames?.length) return [];

    const uniqueNames = Array.from(new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean)));
    if (!uniqueNames.length) return [];

    const existing = await db
      // ✅ الحل الصحيح: استخدام inArray من Drizzle بدلاً من sql.join
      .select({ id: tagsTable.id, name: tagsTable.name })
      .from(tagsTable)
      .where(inArray(sql`lower(${tagsTable.name})`, uniqueNames)); // <-- التغيير هنا

    const existingMap = new Map(existing.map((r) => [r.name.toLowerCase(), r.id]));
    const ids: string[] = existing.map((r) => r.id);

    // Insert missing tags
    const toInsert = uniqueNames.filter((n) => !existingMap.has(n));
    if (toInsert.length > 0) {
      const rows = toInsert.map((name) => ({ id: uuidv4(), name }));
      const inserted = await db.insert(tagsTable).values(rows).onConflictDoNothing().returning();
      ids.push(...inserted.map((r) => r.id));
    }

    return ids;
  }

  static async setComplaintTags(complaintId: string, tagNames: string[]) {
    const tagIds = await TagService.ensureTagsGetIds(tagNames);

    await db.transaction(async (tx) => {
      await tx.delete(complaintTagsTable).where(eq(complaintTagsTable.complaintId, complaintId));

      if (tagIds.length > 0) {
        const relRows = tagIds.map((tagId) => ({
          id: uuidv4(),
          complaintId,
          tagId,
        }));
        await tx.insert(complaintTagsTable).values(relRows).onConflictDoNothing();
      }
    });
  }

  static async getTagsForComplaint(complaintId: string): Promise<string[]> {
    const rows = await db
      .select({ name: tagsTable.name })
      .from(tagsTable)
      .innerJoin(complaintTagsTable, eq(tagsTable.id, complaintTagsTable.tagId))
      .where(eq(complaintTagsTable.complaintId, complaintId));

    return rows.map((r) => r.name);
  }
}

/* ---------------------------
   Attachment Service
   --------------------------- */

class AttachmentService {
  static async addAttachments(
    complaintId: string,
    attachments: Array<{ url: string; filename?: string; size?: number; uploadedBy?: string }>,
  ) {
    if (!attachments?.length) return;

    const rows = attachments.map((att) => ({
      id: uuidv4(),
      complaintId,
      url: att.url,
      filename: att.filename ?? null,
      size: att.size ?? null,
      uploadedBy: att.uploadedBy ?? null,
      createdAt: new Date(),
    }));

    await db.insert(attachmentsTable).values(rows);
  }

  static async getAttachmentsForComplaint(complaintId: string) {
    return await db
      .select()
      .from(attachmentsTable)
      .where(eq(attachmentsTable.complaintId, complaintId))
      .orderBy(asc(attachmentsTable.createdAt));
  }
}

/* ---------------------------
   Activity Service
   --------------------------- */
class ActivityService {
  static async logActivity(complaintId: string, actorId: string | null, action: string, meta?: ActivityMeta) {
    await db.insert(activityTable).values({
      id: uuidv4(),
      complaintId,
      actorId: actorId ?? null,
      action,
      meta: meta ?? null,
      createdAt: new Date(),
    });
  }

  static async logComplaintCreated(
    complaintId: string,
    actorId: string,
    meta: { title: string; priority: string; category: string },
  ) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.created", meta);
  }

  static async logComplaintUpdated(complaintId: string, actorId: string, changedFields: string[]) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.updated", { changed: changedFields });
  }

  static async logComplaintAssigned(complaintId: string, actorId: string, assignedTo: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.assigned", { assignedTo });
  }

  static async logComplaintResolved(complaintId: string, actorId: string, resolutionNotes: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.resolved", { resolutionNotes });
  }

  static async logComplaintClosed(complaintId: string, actorId: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.closed", null);
  }

  static async logComplaintDeleted(complaintId: string, actorId: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.deleted", null);
  }

  static async logComplaintReopened(complaintId: string, actorId: string, reason: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.reopened", { reason });
  }

  static async logComplaintEscalated(complaintId: string, actorId: string, level: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.escalated", { level });
  }

  static async getActivityForComplaint(complaintId: string) {
    return await db
      .select()
      .from(activityTable)
      .where(eq(activityTable.complaintId, complaintId))
      .orderBy(desc(activityTable.createdAt)); // ✅ الأحدث أولاً
  }

  static formatActivityDescription(action: string, meta?: ActivityMeta): string {
    if (!meta) return "";

    switch (action) {
      case "complaint.created":
        return `تم إنشاء الشكوى: ${meta.title} (${meta.priority} - ${meta.category})`;
      case "complaint.updated":
        return `تم تحديث الحقول: ${(meta.changed as string[]).join(", ")}`;
      case "complaint.assigned":
        return `تم التعيين إلى: ${meta.assignedTo}`;
      case "complaint.resolved":
        return `تم الحل مع الملاحظات: ${meta.resolutionNotes}`;
      case "complaint.reopened":
        return `تم إعادة فتح الشكوى: ${meta.reason}`;
      case "complaint.escalated":
        return `تم تصعيد الشكوى إلى المستوى: ${meta.level}`;
      default:
        return JSON.stringify(meta);
    }
  }
}

class CommentService {
  static async addComment(complaintId: string, authorId: string, body: string) {
    await ComplaintRepository.findByIdOrThrow(complaintId);

    const [comment] = await db
      .insert(commentsTable)
      .values({
        id: uuidv4(),
        complaintId,
        authorId,
        body,
        createdAt: new Date(),
      })
      .returning();
    return comment;
  }

  static async listComments(complaintId: string) {
    return await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.complaintId, complaintId))
      .orderBy(desc(commentsTable.createdAt)); // ✅ الأحدث أولاً
  }
}

/* ---------------------------
   Main Complaint Service
   --------------------------- */
export class ComplaintService {
  /* ----- CRUD Operations ----- */
  static async createComplaint(actorId: string, input: CreateComplaintInput) {
    const validated = createComplaintSchema.parse(input);

    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.CREATE, "إنشاء الشكاوى");

    const now = new Date();
    const complaintId = uuidv4();

    // ✅ التحقق من أن المستخدم المعين موجود
    if (validated.assignedTo) {
      await ComplaintRepository.validateUserExists(validated.assignedTo);
    }

    const [created] = await db
      .insert(complaintsTable)
      .values({
        id: complaintId,
        title: validated.title,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        source: validated.source ?? COMPLAINT_CONFIG.DEFAULT_SOURCE,
        submittedBy: actorId,
        assignedTo: validated.assignedTo, // ✅ مطلوب
        status: ComplaintStatus.OPEN, // ✅ الحالة الافتراضية
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
        isActive: true,
        isArchived: false,
        escalationLevel: validated.escalationLevel ?? COMPLAINT_CONFIG.DEFAULT_ESCALATION_LEVEL,
        responseDueAt: validated.responseDueAt ?? null,
        expectedResolutionDate: validated.expectedResolutionDate ?? null,
        isUrgent: validated.isUrgent ?? false,
      })
      .returning();

    // Parallelize dependent operations
    await Promise.all([
      validated.tags?.length ? TagService.setComplaintTags(complaintId, validated.tags) : Promise.resolve(),
      validated.attachments?.length
        ? AttachmentService.addAttachments(
            complaintId,
            validated.attachments.map((url) => ({ url })),
          )
        : Promise.resolve(),
      ActivityService.logComplaintCreated(complaintId, actorId, {
        title: validated.title,
        priority: validated.priority,
        category: validated.category,
      }),
    ]);
    return created;
  }

  static async updateComplaint(actorId: string, input: UpdateComplaintInput) {
    const validated = updateComplaintSchema.parse(input);

    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "تحديث الشكاوى");

    const current = await ComplaintRepository.findByIdOrThrow(validated.id);

    // Validate state transition
    if (validated.status && !canTransition(current.status as ComplaintStatusType, validated.status)) {
      throw Errors.badRequest("الانتقال بين الحالات غير مسموح");
    }

    // Validate resolution notes
    if (validated.status === ComplaintStatus.RESOLVED && !validated.resolutionNotes?.trim()) {
      throw Errors.badRequest("مطلوب ملاحظات الحل عند الانتقال إلى resolved");
    }

    // Validate reopen reason
    if (validated.status === ComplaintStatus.REOPENED && !validated.reopenReason?.trim()) {
      throw Errors.badRequest("مطلوب سبب إعادة الفتح عند الانتقال إلى reopened");
    }

    const { id, ...updateData } = validated;

    const [updated] = await db
      .update(complaintsTable)
      .set({
        ...updateData,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(complaintsTable.id, id))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");

    // Parallelize dependent operations
    await Promise.all([
      updateData.tags ? TagService.setComplaintTags(id, updateData.tags) : Promise.resolve(),
      ActivityService.logComplaintUpdated(id, actorId, Object.keys(updateData)),
    ]);

    return updated;
  }

  static async deleteComplaint(actorId: string, complaintId: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.DELETE, "حذف الشكاوى");
    await ComplaintRepository.findByIdOrThrow(complaintId);

    await db.delete(complaintsTable).where(eq(complaintsTable.id, complaintId));
    await ActivityService.logComplaintDeleted(complaintId, actorId);
  }

  /* ----- Business Operations ----- */
  static async assignComplaint(actorId: string, complaintId: string, assignedTo: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.ASSIGN, "تعيين الشكاوى");
    await ComplaintRepository.findByIdOrThrow(complaintId);
    await ComplaintRepository.validateUserExists(assignedTo);

    const [updated] = await db
      .update(complaintsTable)
      .set({
        assignedTo,
        status: ComplaintStatus.IN_PROGRESS, // ✅ تغيير الحالة إلى قيد التنفيذ عند التعيين
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    await ActivityService.logComplaintAssigned(complaintId, actorId, assignedTo);

    return updated;
  }

  static async resolveComplaint(actorId: string, complaintId: string, resolutionNotes: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE, "حل الشكاوى");
    if (!resolutionNotes?.trim()) {
      throw Errors.badRequest("مطلوب ملاحظات الحل عند حل الشكوى");
    }

    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    if (!canTransition(complaint.status as ComplaintStatusType, ComplaintStatus.RESOLVED)) {
      throw Errors.badRequest("لا يمكن الانتقال إلى resolved من الحالة الحالية");
    }

    const now = new Date();
    const resolutionTime = Math.max(
      0,
      (now.getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60), // hours
    );

    const [updated] = await db
      .update(complaintsTable)
      .set({
        status: ComplaintStatus.RESOLVED,
        resolvedBy: actorId,
        resolvedAt: now,
        resolutionNotes,
        actualResolutionTime: Math.round(resolutionTime),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    await ActivityService.logComplaintResolved(complaintId, actorId, resolutionNotes);

    return updated;
  }

  static async closeComplaint(actorId: string, complaintId: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE, "إغلاق الشكاوى");

    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    // إذا كانت الحالة الحالية هي "resolved"، نحتفظ بها
    // إذا كانت غير محلولة، نحولها إلى "unresolved"
    const finalStatus =
      complaint.status === ComplaintStatus.RESOLVED ? ComplaintStatus.CLOSED : ComplaintStatus.UNRESOLVED;

    if (!canTransition(complaint.status as ComplaintStatusType, finalStatus)) {
      throw Errors.badRequest(`لا يمكن الانتقال إلى ${finalStatus} من الحالة الحالية`);
    }

    const [updated] = await db
      .update(complaintsTable)
      .set({
        status: finalStatus,
        closedBy: actorId,
        closedAt: new Date(),
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    await ActivityService.logComplaintClosed(complaintId, actorId);
    return updated;
  }

  static async reopenComplaint(actorId: string, complaintId: string, reason: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "إعادة فتح الشكاوى");

    if (!reason?.trim()) {
      throw Errors.badRequest("مطلوب سبب إعادة الفتح");
    }
    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    // يمكن إعادة فتح الشكاوى المغلقة أو غير المحلولة فقط
    if (!isClosed(complaint.status as ComplaintStatusType)) {
      throw Errors.badRequest("لا يمكن إعادة فتح شكوى غير مغلقة");
    }

    const updated = await ComplaintRepository.updateStatus(complaintId, ComplaintStatus.REOPENED, {
      reopenReason: reason,
      reopenCount: (complaint.reopenCount ?? 0) + 1,
      isReopened: true,
      resolvedAt: null,
      resolvedBy: null,
      resolutionNotes: undefined,
    });

    await ActivityService.logComplaintReopened(complaintId, actorId, reason);

    return updated;
  }

  static async escalateComplaint(actorId: string, complaintId: string, level: ComplaintEscalationLevel) {
    // <-- ✅ تحديد نوع المعامل
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "تصعيد الشكاوى");

    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    if (isFinalStatus(complaint.status as ComplaintStatusType)) {
      throw Errors.badRequest("لا يمكن تصعيد شكوى في حالة نهائية (مثل مغلقة أو محلولة)");
    }

    // ✅ تعريف مصفوفة من النوع الصحيح
    const escalationLevels: ComplaintEscalationLevel[] = ["none", "level_1", "level_2", "level_3"];

    // ✅ التحقق من أن القيمة من قاعدة البيانات صالحة
    const currentLevel = complaint.escalationLevel as ComplaintEscalationLevel;
    if (!escalationLevels.includes(currentLevel)) {
      throw new Error(`بيانات غير صالحة في قاعدة البيانات: مستوى تصعيد غير معروف (${currentLevel})`);
    }
    const currentLevelIndex = escalationLevels.indexOf(currentLevel); // ✅ لا حاجة لـ any

    // ✅ المعامل 'level' مضمون النوع من توقيع الدالة
    const requestedLevelIndex = escalationLevels.indexOf(level); // ✅ لا حاجة لـ any

    if (requestedLevelIndex <= currentLevelIndex) {
      throw Errors.badRequest(
        `مستوى التصعيد الحالي (${complaint.escalationLevel}) هو نفسه أو أعلى من المستوى المطلوب (${level})`,
      );
    }

    if (currentLevelIndex === escalationLevels.length - 1) {
      throw Errors.badRequest("الشكوى وصلت بالفعل إلى الحد الأقصى من التصعيد");
    }

    const isAlreadyEscalated = complaint.status === ComplaintStatus.ESCALATED;

    const updated = await ComplaintRepository.updateStatus(
      complaintId,
      isAlreadyEscalated ? (complaint.status as ComplaintStatusType) : ComplaintStatus.ESCALATED,
      {
        escalationLevel: level, // ✅ level من النوع الصحيح
      },
    );

    await ActivityService.logComplaintEscalated(complaintId, actorId, level);

    return updated;
  }

  static async updateEscalationLevel(actorId: string, complaintId: string, level: ComplaintEscalationLevel) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "تعديل مستوى التصعيد");

    const [updated] = await db
      .update(complaintsTable)
      .set({
        escalationLevel: level,
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");

    await ActivityService.logActivity(complaintId, actorId, "complaint.level_updated", { newLevel: level });

    return updated;
  }

  /* ----- Query Operations ----- */
  static async getComplaintById(complaintId: string): Promise<ComplaintWithUserDetails | null> {
    const complaint = await ComplaintRepository.findById(complaintId);
    if (!complaint) return null;

    const [attachments, tags, usersMap] = await Promise.all([
      AttachmentService.getAttachmentsForComplaint(complaintId),
      TagService.getTagsForComplaint(complaintId),
      CommentService.listComments(complaintId),
      ActivityService.getActivityForComplaint(complaintId),
      ComplaintService._getComplaintUserMap(complaint),
    ]);

    return ComplaintService._buildComplaintWithDetails(complaint, attachments, tags, usersMap);
  }

  static async listComplaints(
    search?: string,
    status?: string,
    priority?: string,
    category?: string,
    tags?: string[],
    pageSize: number = COMPLAINT_CONFIG.PAGE_SIZE,
    cursor?: string,
    // includeArchived = false,
  ): Promise<PaginatedResult<ComplaintSummary>> {
    // ✅ استخدام Repository Layer من ملفك
    const result = await ComplaintsRepo.listAdvanced({
      search,
      status,
      priority,
      category,
      tagNames: tags,
      pageSize,
      cursor,
    });

    // Bulk user lookup for all items
    const userIds = Array.from(
      new Set(result.items.flatMap((c) => [c.assignedTo, c.submittedBy]).filter((x): x is string => !!x)),
    );

    const usersMap = await ComplaintRepository.bulkGetUserInfo(userIds);

    const enhancedItems = result.items.map((c) => ({
      ...c,
      assignedUserName: c.assignedTo ? usersMap.get(c.assignedTo)?.name || "" : "",
      submittedByUserName: usersMap.get(c.submittedBy)?.name || "",
      // ✅ إضافة الحقول المفقودة وتصحيح الأنواع
      // isUrgent: false,
      // hasAttachments: false,
      // commentCount: 0,
    }));

    return {
      items: enhancedItems as ComplaintSummary[],
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    };
  }

  static async getComplaintStats(): Promise<ComplaintStats> {
    const [basicStats, byCategory, byPriority] = await Promise.all([
      db
        .select({
          total: sql<number>`count(*)`,
          open: sql<number>`sum(case when status = 'open' then 1 else 0 end)`,
          inProgress: sql<number>`sum(case when status = 'in_progress' then 1 else 0 end)`,
          resolved: sql<number>`sum(case when status = 'resolved' then 1 else 0 end)`,
          closed: sql<number>`sum(case when status = 'closed' then 1 else 0 end)`,
          unresolved: sql<number>`sum(case when status = 'unresolved' then 1 else 0 end)`,
          escalated: sql<number>`sum(case when status = 'escalated' then 1 else 0 end)`,
          onHold: sql<number>`sum(case when status = 'on_hold' then 1 else 0 end)`,
          reopened: sql<number>`sum(case when status = 'reopened' then 1 else 0 end)`,
          overdue: sql<number>`sum(case when 
        response_due_at is not null and 
        response_due_at < now() and 
        status in ('open', 'in_progress') 
        then 1 else 0 end)`,
          highPriority: sql<number>`sum(case when priority = 'high' then 1 else 0 end)`,
          urgent: sql<number>`sum(case when is_urgent = true then 1 else 0 end)`,
        })
        .from(complaintsTable),

      db
        .select({ category: complaintsTable.category, count: sql<number>`count(*)` })
        .from(complaintsTable)
        .groupBy(complaintsTable.category),

      db
        .select({ priority: complaintsTable.priority, count: sql<number>`count(*)` })
        .from(complaintsTable)
        .groupBy(complaintsTable.priority),

      db
        .select({ status: complaintsTable.status, count: sql<number>`count(*)` })
        .from(complaintsTable)
        .groupBy(complaintsTable.status),
    ]);

    const stats = basicStats[0];

    // ✅ حساب متوسط وقت الحل
    const avgResolutionTimeResult = await db
      .select({
        avgTime: sql<number>`avg(actual_resolution_time)`,
      })
      .from(complaintsTable)
      .where(sql`actual_resolution_time IS NOT NULL AND actual_resolution_time > 0`);

    const avgResolutionTime = avgResolutionTimeResult[0]?.avgTime ?? 0;

    // ✅ حساب نسبة الرضا
    const satisfactionResult = await db
      .select({
        satisfiedCount: sql<number>`sum(case when satisfaction_rating IN ('satisfied', 'very_satisfied') then 1 else 0 end)`,
        totalCount: sql<number>`count(*)`,
      })
      .from(complaintsTable)
      .where(sql`satisfaction_rating IS NOT NULL`);

    const satisfactionRate = satisfactionResult[0]?.totalCount
      ? (satisfactionResult[0].satisfiedCount / satisfactionResult[0].totalCount) * 100
      : 0;

    return {
      total: stats.total,
      open: stats.open,
      inProgress: stats.inProgress,
      resolved: stats.resolved,
      closed: stats.closed,
      unresolved: stats.unresolved,
      escalated: stats.escalated,
      onHold: stats.onHold,
      reopened: stats.reopened,
      overdue: stats.overdue,
      highPriority: stats.highPriority,
      urgent: stats.urgent,
      byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r.count])),
      byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r.count])),
      byStatus: {
        open: stats.open,
        in_progress: stats.inProgress,
        resolved: stats.resolved,
        closed: stats.closed,
        unresolved: stats.unresolved,
        escalated: stats.escalated,
        on_hold: stats.onHold,
        reopened: stats.reopened,
      },
      // ✅ إضافة الحقول المفقودة
      byAssignee: {},
      bySource: {},
      avgResolutionTime,
      satisfactionRate,
    };
  }

  static async getComplaintProfileData(complaintId: string): Promise<ComplaintProfileData | null> {
    const [complaint, comments, activity] = await Promise.all([
      ComplaintService.getComplaintById(complaintId),
      CommentService.listComments(complaintId),
      ActivityService.getActivityForComplaint(complaintId),
    ]);

    if (!complaint) return null;

    // ✅ حساب وقت الاستجابة
    let responseTime = 0; // hours
    if (complaint.resolvedAt) {
      responseTime = Math.max(
        0,
        (new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime()) /
          (1000 * 60 * 60),
      );
    } else {
      responseTime = Math.max(0, (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60));
    }

    // ✅ حساب وقت الحل
    const resolutionTime = complaint.resolvedAt
      ? Math.max(
          0,
          (new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime()) /
            (1000 * 60 * 60),
        )
      : 0;

    // ✅ حساب الوقت الكلي
    const totalTime = complaint.closedAt
      ? Math.max(
          0,
          (new Date(complaint.closedAt).getTime() - new Date(complaint.createdAt).getTime()) /
            (1000 * 60 * 60),
        )
      : Math.max(0, (Date.now() - new Date(complaint.createdAt).getTime()) / (1000 * 60 * 60));

    // ✅ حساب متوسط التقييم
    let satisfactionScore: number | null = null;
    if (complaint.satisfactionRating) {
      const ratingMap: Record<string, number> = {
        very_dissatisfied: 1,
        dissatisfied: 2,
        neutral: 3,
        satisfied: 4,
        very_satisfied: 5,
      };
      satisfactionScore = ratingMap[complaint.satisfactionRating];
    }

    const statistics = {
      totalComments: comments.length,
      responseTime,
      resolutionTime,
      totalTime,
      reopenCount: complaint.reopenCount ?? 0,
      satisfactionScore,
    };

    // ✅ بناء الجدول الزمني
    const timeline = [
      {
        status: complaint.status as ComplaintStatusType,
        timestamp: complaint.createdAt,
        notes: "تم إنشاء الشكوى",
        actor: complaint.submittedBy,
      },
      ...(complaint.assignedTo
        ? [
            {
              status: "in_progress" as ComplaintStatusType,
              timestamp: complaint.lastActivityAt,
              notes: "تم التعيين",
              actor: complaint.assignedTo,
            },
          ]
        : []),
      ...(complaint.resolvedAt
        ? [
            {
              status: "resolved" as ComplaintStatusType,
              timestamp: complaint.resolvedAt,
              notes: "تم الحل",
              actor: complaint.resolvedBy,
            },
          ]
        : []),
      ...(complaint.closedAt
        ? [
            {
              status: "closed" as ComplaintStatusType,
              timestamp: complaint.closedAt,
              notes: "تم الإغلاق",
              actor: complaint.closedBy,
            },
          ]
        : []),
    ];

    // ✅ إنشاء خريطة المستخدمين محليًا
    const usersMap = await ComplaintService._getComplaintUserMap(complaint);

    return {
      complaint,
      statistics,
      activity: activity.map((a) => ({
        id: a.id,
        action: a.action,
        description: ActivityService.formatActivityDescription(a.action, a.meta as ActivityMeta),
        timestamp: a.createdAt,
        type: (a.action.includes("assign")
          ? "assign"
          : a.action.includes("resolve")
            ? "resolve"
            : a.action.includes("close")
              ? "close"
              : a.action.includes("reopened")
                ? "reassign"
                : a.action.includes("escalated")
                  ? "escalate"
                  : "update") as
          | "update"
          | "assign"
          | "resolve"
          | "close"
          | "comment"
          | "reassign"
          | "escalate",
        actorName: a.actorId ? usersMap.get(a.actorId)?.name || null : null,
      })),
      timeline,
    };
  }

  /* ----- Private Helpers ----- */
  private static async _getComplaintUserMap(
    complaint: typeof complaintsTable.$inferSelect,
  ): Promise<UserInfoMap> {
    const userIds = [
      complaint.submittedBy,
      complaint.assignedTo,
      complaint.resolvedBy,
      complaint.closedBy,
      complaint.archivedBy,
    ].filter((x): x is string => !!x);

    return ComplaintRepository.bulkGetUserInfo(userIds);
  }

  private static _buildComplaintWithDetails(
    complaint: typeof complaintsTable.$inferSelect,
    attachments: (typeof attachmentsTable.$inferSelect)[],
    tags: string[],
    usersMap: UserInfoMap,
  ): ComplaintWithUserDetails {
    return {
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status as ComplaintStatusType, // ✅ محسّن
      priority: complaint.priority as "low" | "medium" | "high" | "critical",
      category: complaint.category,
      assignedTo: complaint.assignedTo, // ✅ لا يمكن أن يكون null
      submittedBy: complaint.submittedBy,
      attachments: attachments.map((a) => a.url),
      resolutionNotes: complaint.resolutionNotes ?? null,
      resolvedAt: complaint.resolvedAt ?? null,
      resolvedBy: complaint.resolvedBy ?? null,
      closedAt: complaint.closedAt ?? null,
      closedBy: complaint.closedBy ?? null,
      lastActivityAt: complaint.lastActivityAt,
      source: complaint.source as "web_form" | "email" | "phone" | "mobile_app" | "api",
      tags,
      escalationLevel: complaint.escalationLevel as "none" | "level_1" | "level_2" | "level_3",
      satisfactionRating: complaint.satisfactionRating as
        | "very_dissatisfied"
        | "dissatisfied"
        | "neutral"
        | "satisfied"
        | "very_satisfied"
        | null,
      responseDueAt: complaint.responseDueAt ?? null,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      isActive: complaint.isActive,
      isArchived: complaint.isArchived,
      archivedAt: complaint.archivedAt ?? null,
      archivedBy: complaint.archivedBy ?? null,
      assignedUserName: usersMap.get(complaint.assignedTo)?.name || "", // ✅ لا يمكن أن يكون null
      assignedUserEmail: usersMap.get(complaint.assignedTo)?.email || "", // ✅ لا يمكن أن يكون null
      submittedByUserName: usersMap.get(complaint.submittedBy)?.name || "",
      submittedByUserEmail: usersMap.get(complaint.submittedBy)?.email || "",
      // ✅ إضافات جديدة
      isUrgent: complaint.isUrgent,
      expectedResolutionDate: complaint.expectedResolutionDate ?? null,
      actualResolutionTime: complaint.actualResolutionTime ?? null,
      isReopened: complaint.isReopened,
      reopenCount: complaint.reopenCount ?? 0,
      reopenReason: complaint.reopenReason ?? null,
    };
  }

  // ✅ دالة جديدة مساعدة لبناء الخط الزمني
  private static _buildTimelineFromActivity(
    activity: (typeof activityTable.$inferSelect)[],
    usersMap: UserInfoMap,
  ): Array<{
    status: ComplaintStatusType;
    timestamp: Date;
    notes: string | null;
    actor: string | null;
  }> {
    const timeline: Array<{
      status: ComplaintStatusType;
      timestamp: Date;
      notes: string | null;
      actor: string | null;
    }> = [];

    // ترتيب النشاط حسب الوقت
    const sortedActivity = activity.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const act of sortedActivity) {
      let status: ComplaintStatusType | null = null;
      let notes = "";
      const actor = act.actorId ? usersMap.get(act.actorId)?.name || "غير معروف" : null;
      const meta = act.meta as any;

      switch (act.action) {
        case "complaint.assigned":
          status = "in_progress";
          notes = `تم التعيين إلى: ${meta?.assignedTo || "غير محدد"} بواسطة: ${actor}`;
          break;
        case "complaint.resolved":
          status = "resolved";
          notes = `تم حل الشكوى: ${meta?.resolutionNotes || "بدون ملاحظات"} بواسطة: ${actor}`;
          break;
        case "complaint.closed":
          status = "closed";
          notes = `تم إغلاق الشكوى بواسطة: ${actor}`;
          break;
        case "complaint.reopened":
          status = "reopened";
          notes = `تم إعادة فتح الشكوى: ${meta?.reason || "بدون سبب"} بواسطة: ${actor}`;
          break;
        case "complaint.escalated": {
          status = "escalated";
          const level = meta.level as string;
          const levelLabels: Record<string, string> = {
            level_1: "الأول",
            level_2: "الثاني",
            level_3: "الثالث",
          };
          const arabicLevel = levelLabels[level] || level;
          notes = `تم تصعيد الشكوى إلى المستوى ${arabicLevel} بواسطة: ${actor}`;
          break;
        }
      }
      if (status) {
        timeline.push({
          status,
          // ✅ استخدم createdAt بدلاً من timestamp
          timestamp: act.createdAt,
          notes,
          actor,
        });
      }
    }
    return timeline;
  }
}

/* ---------------------------
   Legacy Export Compatibility
   --------------------------- */
export const {
  createComplaint,
  updateComplaint,
  deleteComplaint,
  assignComplaint,
  resolveComplaint,
  closeComplaint,
  getComplaintById,
  listComplaints,
  getComplaintStats,
  getComplaintProfileData,
} = ComplaintService;

// تصدير دالة addComment من الكلاس CommentService
export async function addComment(complaintId: string, authorId: string, body: string) {
  return await CommentService.addComment(complaintId, authorId, body);
}

// ✅ إضافات جديدة
export async function reopenComplaint(actorId: string, complaintId: string, reason: string) {
  return await ComplaintService.reopenComplaint(actorId, complaintId, reason);
}

export async function escalateComplaint(
  actorId: string,
  complaintId: string,
  level: ComplaintEscalationLevel,
) {
  return await ComplaintService.escalateComplaint(actorId, complaintId, level);
}
