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
  isResolved,
} from "@/lib/complaints/state/complaint-status";
import type {
  ComplaintActivityType,
  ComplaintEscalationLevelType,
  ComplaintPriorityType,
  ComplaintProfileData,
  ComplaintSatisfactionRatingType,
  ComplaintSourceType,
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
import { emailService } from "@/lib/services/email/services/email-service";
import { EMAIL_PRIORITY, EMAIL_TEMPLATES } from "@/lib/services/email/types/email-types";
import { authorizeComplaints } from "@/lib/shared/functions/authorize-complaints";

/* ---------------------------
   Types & Constants
   --------------------------- */
type ActivityMeta = Record<string, unknown> | null;
type UserInfoMap = Map<string, { name: string; email: string }>;

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
        assignedTo: additionalFields.assignedTo ?? undefined,
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");
    return updated;
  }
  static async bulkGetUserInfo(userIds: string[]): Promise<UserInfoMap> {
    if (userIds.length === 0) return new Map();

    const uniqueIds = [...new Set(userIds)];

    const users = await db
      .select({ id: userTable.id, name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(inArray(userTable.id, uniqueIds));

    // ✅ هذا هو السطر الحاسم: تحويل المصفوفة إلى Map
    return new Map(users.map((user) => [user.id, user]));
  }
  static async validateUserExists(userId: string) {
    const [user] = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        personalEmail: userTable.personalEmail,
      })
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

    const uniqueNames = Array.from(
      new Set(tagNames.map((t) => t.trim().toLowerCase()).filter(Boolean)),
    );
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
  static async logActivity(
    complaintId: string,
    actorId: string | null,
    action: string,
    meta?: ActivityMeta,
  ) {
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
    await ActivityService.logActivity(complaintId, actorId, "complaint.updated", {
      changed: changedFields,
    });
  }

  static async logComplaintAssigned(complaintId: string, actorId: string, assignedTo: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.assigned", { assignedTo });
  }

  static async logComplaintResolved(complaintId: string, actorId: string, resolutionNotes: string) {
    await ActivityService.logActivity(complaintId, actorId, "complaint.resolved", {
      resolutionNotes,
    });
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

    // تحديد الحالة الابتدائية
    const initialStatus = validated.assignedTo
      ? ComplaintStatus.IN_PROGRESS // إذا تم التعيين
      : ComplaintStatus.OPEN;

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
        assignedTo: validated.assignedTo,
        status: initialStatus,
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
      validated.tags?.length
        ? TagService.setComplaintTags(complaintId, validated.tags)
        : Promise.resolve(),
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
      // إرسال إشعار التعيين إذا تم تحديد موظف
      validated.assignedTo
        ? ComplaintService.sendAssignmentNotification(complaintId, validated.assignedTo, actorId)
        : Promise.resolve(),
    ]);
    return created;
  }

  static async updateComplaint(actorId: string, input: UpdateComplaintInput) {
    // ⚡ استخراج البيانات بشكل فوري
    const { id, ...updateData } = input;

    // ⚡ تحقق فائق السرعة من التغييرات
    let hasChanges = false;
    for (const key in updateData) {
      if (updateData[key as keyof typeof updateData] !== undefined) {
        hasChanges = true;
        break;
      }
    }

    if (!hasChanges) {
      throw Errors.badRequest("لا توجد تغييرات لحفظها");
    }

    // ⚡ تحقق متوازي من الصلاحيات والبيانات
    const [validationResult, currentComplaint] = await Promise.all([
      updateComplaintSchema.parseAsync(input).catch(() => null),
      ComplaintRepository.findByIdOrThrow(id),
    ]);

    if (!validationResult) {
      throw Errors.badRequest("بيانات غير صالحة");
    }

    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "تحديث الشكاوى");

    // ⚡ تحقق سريع من انتقال الحالة
    if (updateData.status && updateData.status !== currentComplaint.status) {
      if (!canTransition(currentComplaint.status as ComplaintStatusType, updateData.status)) {
        throw Errors.badRequest("الانتقال بين الحالات غير مسموح");
      }
    }

    // ⚡ تحديث فوري في قاعدة البيانات
    const now = new Date();
    const [updated] = await db
      .update(complaintsTable)
      .set({
        ...updateData,
        updatedAt: now,
        lastActivityAt: now,
      })
      .where(eq(complaintsTable.id, id))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");

    // ⚡ عمليات خلفية فورية بدون انتظار
    ComplaintService._fireAndForgetBackgroundTasks(id, updateData, actorId);

    // إرسال إشعار بتغيير الحالة إذا حدث
    if (updateData.status && updateData.status !== currentComplaint.status) {
      ComplaintService.sendStatusUpdateNotification(id, currentComplaint.status, updateData.status, actorId).catch(console.error);
    }


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

    // إرسال إشعار بالبريد الإلكتروني
    ComplaintService.sendAssignmentNotification(complaintId, assignedTo, actorId).catch(console.error);

    return updated;

  }

  static async resolveComplaint(actorId: string, complaintId: string, resolutionNotes: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.RESOLVE, "حل الشكاوى");
    if (!resolutionNotes?.trim()) {
      throw Errors.badRequest("مطلوب ملاحظات الحل عند حل الشكوى");
    }

    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);
    if (!canTransition(complaint.status as ComplaintStatusType, ComplaintStatus.RESOLVED)) {
      throw Errors.badRequest(
        `لا يمكن حل الشكوى من الحالة الحالية (${complaint.status}). ` +
        `يجب ان تكون الشكوى في حالة ${ComplaintStatus.IN_PROGRESS}`,
      );
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
        updatedAt: now,
        lastActivityAt: now,
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");

    await ActivityService.logComplaintResolved(complaintId, actorId, resolutionNotes);

    // إرسال إشعار بالبريد الإلكتروني
    ComplaintService.sendResolutionNotification(complaintId, resolutionNotes, actorId).catch(console.error);

    return updated;

  }

  static async closeComplaint(actorId: string, complaintId: string) {
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.CLOSE, "إغلاق الشكاوى");
    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    if (isFinalStatus(complaint.status as ComplaintStatusType)) {
      throw Errors.badRequest(
        "لا يمكن إغلاق الشكوى من الحالة الحالية. الشكوى محلولة أو مغلقة بالفعل",
      );
    }

    const now = new Date();
    const finalStatus = isResolved(complaint.status as ComplaintStatusType)
      ? ComplaintStatus.RESOLVED
      : ComplaintStatus.UNRESOLVED;

    const [updated] = await db
      .update(complaintsTable)
      .set({
        status: finalStatus,
        closedBy: actorId,
        closedAt: now,
        updatedAt: now,
        lastActivityAt: now,
      })
      .where(eq(complaintsTable.id, complaintId))
      .returning();

    if (!updated) throw Errors.notFound("الشكوى");

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

  static async escalateComplaint(
    actorId: string,
    complaintId: string,
    level: ComplaintEscalationLevelType,
  ) {
    // <-- ✅ تحديد نوع المعامل
    authorizeComplaints(actorId, AUDIT_LOG_ACTIONS.COMPLAINT.UPDATE, "تصعيد الشكاوى");

    const complaint = await ComplaintRepository.findByIdOrThrow(complaintId);

    if (isFinalStatus(complaint.status as ComplaintStatusType)) {
      throw Errors.badRequest("لا يمكن تصعيد شكوى في حالة نهائية (مثل مغلقة أو محلولة)");
    }

    // ✅ تعريف مصفوفة من النوع الصحيح
    const escalationLevels: ComplaintEscalationLevelType[] = [
      "none",
      "level_1",
      "level_2",
      "level_3",
    ];

    // ✅ التحقق من أن القيمة من قاعدة البيانات صالحة
    const currentLevel = complaint.escalationLevel as ComplaintEscalationLevelType;
    if (!escalationLevels.includes(currentLevel)) {
      throw new Error(
        `بيانات غير صالحة في قاعدة البيانات: مستوى تصعيد غير معروف (${currentLevel})`,
      );
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

  static async updateEscalationLevel(
    actorId: string,
    complaintId: string,
    level: ComplaintEscalationLevelType,
  ) {
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

    await ActivityService.logActivity(complaintId, actorId, "complaint.level_updated", {
      newLevel: level,
    });

    return updated;
  }

  static async getAssignableUsers() {
    return await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
      })
      .from(userTable)
      .orderBy(asc(userTable.name));
  }

  /* ----- Query Operations ----- */
  static async getComplaintById(complaintId: string): Promise<ComplaintWithUserDetails | null> {
    const complaint = await ComplaintRepository.findById(complaintId);
    if (!complaint) return null;

    // ✅ جلب جميع البيانات بشكل صحيح
    const [attachments, tags, comments, activity, usersMap] = await Promise.all([
      AttachmentService.getAttachmentsForComplaint(complaintId),
      TagService.getTagsForComplaint(complaintId),
      CommentService.listComments(complaintId),
      ActivityService.getActivityForComplaint(complaintId),
      ComplaintService._getComplaintUserMap(complaint),
    ]);

    // ✅ الآن قم بتمرير جميع البيانات إلى دالة البناء
    return ComplaintService._buildComplaintWithDetails(
      complaint,
      attachments,
      tags,
      usersMap,
      comments,
      activity,
    );
  }

  static async listComplaints(
    search?: string,
    status?: string,
    priority?: string,
    category?: string,
    tags?: string[],
    pageSize: number = COMPLAINT_CONFIG.PAGE_SIZE,
    cursor?: string,
    includeArchived = false,
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
      includeArchived,
    });

    // Bulk user lookup for all items
    const userIds = Array.from(
      new Set(
        result.items.flatMap((c) => [c.assignedTo, c.submittedBy]).filter((x): x is string => !!x),
      ),
    );

    const usersMap = await ComplaintRepository.bulkGetUserInfo(userIds);

    const enhancedItems = result.items.map((c) => ({
      ...c,
      assignedUserName: c.assignedTo ? usersMap.get(c.assignedTo)?.name || "" : "",
      submittedByUserName: usersMap.get(c.submittedBy)?.name || "",
      // ✅ إضافة الحقول المفقودة وتصحيح الأنواع
      isUrgent: false,
      hasAttachments: false,
      commentCount: 0,
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

    // ✅ تحسين حساب وقت الاستجابة: الوقت حتى أول تعيين أو أول تعليق من فريق الدعم
    let responseTime = 0; // hours
    const firstAssignmentActivity = activity.find((a) => a.action === "complaint.assigned");
    const firstSupportComment = comments.find((c) => c.authorId !== complaint.submittedBy);

    if (firstAssignmentActivity) {
      responseTime = Math.max(
        0,
        (new Date(firstAssignmentActivity.createdAt).getTime() -
          new Date(complaint.createdAt).getTime()) /
        (1000 * 60 * 60),
      );
    } else if (firstSupportComment) {
      responseTime = Math.max(
        0,
        (new Date(firstSupportComment.createdAt).getTime() -
          new Date(complaint.createdAt).getTime()) /
        (1000 * 60 * 60),
      );
    }

    // ✅ حساب وقت الحل: من الإنشاء إلى الحل الفعلي
    const resolutionTime = complaint.resolvedAt
      ? Math.max(
        0,
        (new Date(complaint.resolvedAt).getTime() - new Date(complaint.createdAt).getTime()) /
        (1000 * 60 * 60),
      )
      : 0;

    // ✅ حساب الوقت الكلي: من الإنشاء إلى الإغلاق أو الوقت الحالي
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

    // ✅ جلب جميع المستخدمين من الشكوى والنشاط
    const allUserIds = [
      complaint.submittedBy,
      complaint.assignedTo,
      complaint.resolvedBy,
      complaint.closedBy,
      complaint.archivedBy,
      // ✅ إضافة جميع المستخدمين من سجل النشاط أيضاً
      ...(activity.map((a) => a.actorId).filter(Boolean) as string[]),
      ...(comments.map((c) => c.authorId).filter(Boolean) as string[]), // أضفنا معرفات كتّاب التعليقات
    ] as string[];

    const usersMap = await ComplaintRepository.bulkGetUserInfo(allUserIds);

    // ✅ بناء الخط الزمني بالطريقة الجديدة
    const timeline = ComplaintService._buildTimelineFromActivity(
      activity,
      usersMap,
      complaint.submittedBy,
    );

    // ✅ تحسين بيانات الأنشطة لتشمل التعليقات
    const enhancedActivity = [
      ...activity.map((a) => ({
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
                  : "update") as ComplaintActivityType,
        actorName: a.actorId ? usersMap.get(a.actorId)?.name || null : null,
      })),
      // ✅ إضافة التعليقات كأنشطة
      ...comments.map((c) => ({
        id: c.id,
        action: "comment.added",
        description: c.body,
        timestamp: c.createdAt,
        type: "comment" as ComplaintActivityType,
        actorName: c.authorId ? usersMap.get(c.authorId)?.name || null : null,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // ترتيب من الأحدث إلى الأقدم

    return {
      complaint,
      statistics,
      activity: enhancedActivity, // استخدام الأنشطة المحسّنة
      timeline,
    };
  }

  /* ----- Notification Helpers ----- */
  private static async sendAssignmentNotification(complaintId: string, assignedToId: string, assignedById: string) {
    try {
      const [complaint, assignedToUser, assignedByUser] = await Promise.all([
        ComplaintRepository.findById(complaintId),
        ComplaintRepository.validateUserExists(assignedToId),
        ComplaintRepository.validateUserExists(assignedById),
      ]);

      if (!complaint || !assignedToUser.personalEmail) return;

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const complaintUrl = `${baseUrl}/admin/complaints/${complaintId}`;

      await emailService.send({
        to: assignedToUser.personalEmail,
        subject: `تم تعيين شكوى جديدة لك: ${complaint.title}`,
        template: EMAIL_TEMPLATES.COMPLAINT_ASSIGNED,
        templateData: {
          userName: assignedToUser.name,
          complaintId: complaint.id,
          complaintTitle: complaint.title,
          category: complaint.category,
          priority: complaint.priority,
          assignedBy: assignedByUser.name,
          dueDate: complaint.responseDueAt ? new Date(complaint.responseDueAt).toLocaleDateString("ar-EG") : undefined,
          complaintUrl,
        },
        priority: EMAIL_PRIORITY.HIGH,
      });
    } catch (error) {
      console.error("❌ Failed to send assignment notification:", error);
    }
  }

  private static async sendStatusUpdateNotification(complaintId: string, oldStatus: string, newStatus: string, updatedById: string) {
    try {
      const [complaint, updatedByUser] = await Promise.all([
        ComplaintRepository.findById(complaintId),
        ComplaintRepository.validateUserExists(updatedById),
      ]);

      if (!complaint) return;

      // Notify the submitter
      const submitter = await ComplaintRepository.validateUserExists(complaint.submittedBy);
      if (submitter && submitter.personalEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const complaintUrl = `${baseUrl}/dashboard/complaints/${complaintId}`;

        await emailService.send({
          to: submitter.personalEmail,
          subject: `تحديث حالة الشكوى: ${complaint.title}`,
          template: EMAIL_TEMPLATES.COMPLAINT_STATUS_UPDATED,
          templateData: {
            userName: submitter.name,
            complaintId: complaint.id,
            complaintTitle: complaint.title,
            oldStatus,
            newStatus,
            updatedBy: updatedByUser.name,
            complaintUrl,
          },
        });
      }
    } catch (error) {
      console.error("❌ Failed to send status update notification:", error);
    }
  }

  private static async sendResolutionNotification(complaintId: string, resolutionNotes: string, resolvedById: string) {
    try {
      const [complaint, resolvedByUser] = await Promise.all([
        ComplaintRepository.findById(complaintId),
        ComplaintRepository.validateUserExists(resolvedById),
      ]);

      if (!complaint) return;

      // Notify the submitter
      const submitter = await ComplaintRepository.validateUserExists(complaint.submittedBy);
      if (submitter && submitter.personalEmail) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const complaintUrl = `${baseUrl}/dashboard/complaints/${complaintId}`;

        const resolutionTimeHours = complaint.actualResolutionTime || 0;
        const resolutionTimeText = resolutionTimeHours > 24
          ? `${Math.round(resolutionTimeHours / 24)} يوم`
          : `${resolutionTimeHours} ساعة`;

        await emailService.send({
          to: submitter.personalEmail,
          subject: `تم حل الشكوى: ${complaint.title}`,
          template: EMAIL_TEMPLATES.COMPLAINT_RESOLVED,
          templateData: {
            userName: submitter.name,
            complaintId: complaint.id,
            complaintTitle: complaint.title,
            resolvedBy: resolvedByUser.name,
            resolutionNotes,
            resolutionTime: resolutionTimeText,
            complaintUrl,
          },
          priority: EMAIL_PRIORITY.HIGH,
        });
      }
    } catch (error) {
      console.error("❌ Failed to send resolution notification:", error);
    }
  }

  /* ----- Private Helpers ----- */
  private static _fireAndForgetBackgroundTasks(
    complaintId: string,
    updateData: Partial<UpdateComplaintInput>,
    actorId: string,
  ): void {
    // ⚡ تشغيل في الخلفية بدون انتظار
    setImmediate(async () => {
      try {
        const tasks: Promise<unknown>[] = [];

        // تحديث الـ tags إذا كانت متغيرة
        if (updateData.tags !== undefined) {
          tasks.push(TagService.setComplaintTags(complaintId, updateData.tags));
        }

        // تسجيل النشاط
        const changedFields = Object.keys(updateData).filter(
          (key) => updateData[key as keyof typeof updateData] !== undefined,
        );

        if (changedFields.length > 0) {
          tasks.push(ActivityService.logComplaintUpdated(complaintId, actorId, changedFields));
        }

        // تنفيذ المهام بشكل متوازي مع timeout
        if (tasks.length > 0) {
          await Promise.race([
            Promise.allSettled(tasks),
            new Promise((resolve) => setTimeout(resolve, 5000)), // timeout 5 ثواني
          ]);
        }
      } catch {
        // تجاهل كافة الأخطاء في العمليات الثانوية
      }
    });
  }
  private static async _getComplaintUserMap(
    complaint: typeof complaintsTable.$inferSelect,
  ): Promise<UserInfoMap> {
    const userIds = [
      complaint.submittedBy,
      complaint.closedBy,
      complaint.assignedTo,
      complaint.resolvedBy,
      complaint.archivedBy,
    ].filter((x): x is string => !!x);

    // استدعاء الدالة التي تُرجع Map
    const usersMap = await ComplaintRepository.bulkGetUserInfo(userIds);

    // ✅ التأكد من إرجاع Map
    return usersMap;
  }
  private static _buildComplaintWithDetails(
    complaint: typeof complaintsTable.$inferSelect,
    attachments: (typeof attachmentsTable.$inferSelect)[],
    tags: string[],
    usersMap: UserInfoMap,
    comments: (typeof commentsTable.$inferSelect)[], // ✅ إضافة
    activity: (typeof activityTable.$inferSelect)[], // ✅ إضافة
  ): ComplaintWithUserDetails {
    return {
      id: complaint.id,
      title: complaint.title,
      description: complaint.description,
      status: complaint.status as ComplaintStatusType,
      priority: complaint.priority as ComplaintPriorityType,
      category: complaint.category,
      assignedTo: complaint.assignedTo,
      submittedBy: complaint.submittedBy,
      attachments: attachments.map((a) => a.url),
      resolutionNotes: complaint.resolutionNotes ?? null,
      resolvedAt: complaint.resolvedAt ?? null,
      resolvedBy: complaint.resolvedBy ?? null,
      closedAt: complaint.closedAt ?? null,
      closedBy: complaint.closedBy ?? null,
      lastActivityAt: complaint.lastActivityAt,
      tags,
      source: complaint.source as ComplaintSourceType,
      escalationLevel: complaint.escalationLevel as ComplaintEscalationLevelType,
      satisfactionRating: complaint.satisfactionRating as ComplaintSatisfactionRatingType,
      responseDueAt: complaint.responseDueAt ?? null,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      isActive: complaint.isActive,
      isArchived: complaint.isArchived,
      archivedAt: complaint.archivedAt ?? null,
      archivedBy: complaint.archivedBy ?? null,
      assignedUserName: complaint.assignedTo ? usersMap.get(complaint.assignedTo)?.name || "" : "",
      assignedUserEmail: complaint.assignedTo
        ? usersMap.get(complaint.assignedTo)?.email || ""
        : "",
      submittedByUserName: usersMap.get(complaint.submittedBy)?.name || "",
      submittedByUserEmail: usersMap.get(complaint.submittedBy)?.email || "",
      // ✅ إضافات جديدة
      isUrgent: complaint.isUrgent,
      expectedResolutionDate: complaint.expectedResolutionDate ?? null,
      actualResolutionTime: complaint.actualResolutionTime ?? null,
      isReopened: complaint.isReopened,
      reopenCount: complaint.reopenCount ?? 0,
      reopenReason: complaint.reopenReason ?? null,
      // comments,
      // activity,
    };
  }
  private static _buildTimelineFromActivity(
    activity: (typeof activityTable.$inferSelect)[],
    usersMap: UserInfoMap,
    submittedById: string, // ✅ تمرير معرف مقدم الشكوى
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

    // 1. إضافة حدث الإنشاء الأولي دائمًا
    const submitterName = usersMap.get(submittedById)?.name || "غير معروف";

    // البحث عن نشاط الإنشاء
    const createdActivity = activity.find((a) => a.action === "complaint.created");
    const createdAt = createdActivity ? createdActivity.createdAt : new Date();

    timeline.push({
      status: "open",
      timestamp: createdAt,
      notes: "تم إنشاء الشكوى",
      actor: submitterName,
    });

    // ترتيب النشاط حسب الوقت
    const sortedActivity = activity.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    for (const act of sortedActivity) {
      let status: ComplaintStatusType | null = null;
      let notes = "";
      const actor = act.actorId ? usersMap.get(act.actorId)?.name || "غير معروف" : null;
      const meta = act.meta as ActivityMeta;

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
          const level = meta?.level as string;
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
export async function reopenComplaint(actorId: string, complaintId: string, reason: string) {
  return await ComplaintService.reopenComplaint(actorId, complaintId, reason);
}
export async function escalateComplaint(
  actorId: string,
  complaintId: string,
  level: ComplaintEscalationLevelType,
) {
  return await ComplaintService.escalateComplaint(actorId, complaintId, level);
}
