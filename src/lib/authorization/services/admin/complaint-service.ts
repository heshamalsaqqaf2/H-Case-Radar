import { and, eq, sql } from "drizzle-orm";
import { authorizationService } from "@/lib/authorization/services/core/authorization-service";
import type { ComplaintProfileData } from "@/lib/authorization/types/complaint";
import type {
  CreateComplaintInput,
  UpdateComplaintInput,
} from "@/lib/authorization/validators/admin/complaint-validator";
import { complaint, user } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";
import { Errors } from "@/lib/errors/error-factory";

async function authorize(userId: string, requiredPermission: string) {
  const check = await authorizationService.checkPermission(
    { userId },
    requiredPermission,
  );
  if (!check.allowed) {
    throw Errors.forbidden("إدارة الشكاوى");
  }
}

export async function createComplaint(
  userId: string,
  input: CreateComplaintInput,
) {
  await authorize(userId, "complaint.create");

  const existing = await db
    .select({ id: complaint.id })
    .from(complaint)
    .where(eq(complaint.title, input.title))
    .limit(1);

  if (existing.length > 0) {
    throw Errors.conflict("عنوان الشكوى مستخدم بالفعل");
  }

  const [newComplaint] = await db
    .insert(complaint)
    .values({
      ...input,
      submittedBy: userId,
      lastActivityAt: new Date(),
    })
    .returning();
  return newComplaint;
}

export async function updateComplaint(
  userId: string,
  input: UpdateComplaintInput,
) {
  await authorize(userId, "complaint.update");

  const conflict = await db
    .select({ id: complaint.id })
    .from(complaint)
    .where(
      and(
        eq(complaint.title, input.title),
        sql`${complaint.id} != ${input.id}`,
      ),
    )
    .limit(1);

  if (conflict.length > 0) {
    throw Errors.conflict("عنوان الشكوى مستخدم من قبل شكوى أخرى");
  }

  const [updated] = await db
    .update(complaint)
    .set({
      ...input,
      updatedAt: new Date(),
      lastActivityAt: new Date(),
      resolvedAt: input.status === "resolved" ? new Date() : undefined,
      resolvedBy: input.status === "resolved" ? userId : undefined,
      closedAt: input.status === "closed" ? new Date() : undefined,
      closedBy: input.status === "closed" ? userId : undefined,
    })
    .where(eq(complaint.id, input.id))
    .returning();

  if (!updated) throw Errors.notFound("الشكوى");
  return updated;
}

export async function deleteComplaint(userId: string, complaintId: string) {
  await authorize(userId, "complaint.delete");

  await db
    .update(complaint)
    .set({ isActive: false, lastActivityAt: new Date() })
    .where(eq(complaint.id, complaintId));
}

// *جلب بيانات ملف معلومات الشكوى
export async function getComplaintProfileData(
  complaintId: string,
): Promise<ComplaintProfileData | null> {
  const [complaintData, submittedByUser, assignedToUser] = await Promise.all([
    db
      .select({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        status: complaint.status,
        priority: complaint.priority,
        category: complaint.category,
        assignedTo: complaint.assignedTo,
        submittedBy: complaint.submittedBy,
        attachments: complaint.attachments,
        resolutionNotes: complaint.resolutionNotes,
        resolvedAt: complaint.resolvedAt,
        resolvedBy: complaint.resolvedBy,
        closedAt: complaint.closedAt,
        closedBy: complaint.closedBy,
        lastActivityAt: complaint.lastActivityAt,
        source: complaint.source,
        tags: complaint.tags,
        escalationLevel: complaint.escalationLevel,
        satisfactionRating: complaint.satisfactionRating,
        responseDueAt: complaint.responseDueAt,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        isActive: complaint.isActive,
        isArchived: complaint.isArchived,
        archivedAt: complaint.archivedAt,
        archivedBy: complaint.archivedBy,
      })
      .from(complaint)
      .where(eq(complaint.id, complaintId))
      .limit(1),

    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, complaint.submittedBy))
      .limit(1),

    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(eq(user.id, complaint.assignedTo))
      .limit(1),
  ]);

  if (complaintData.length === 0) return null;

  const row = complaintData[0];

  // casting attachments و tags و satisfactionRating
  let attachments: Record<string, unknown>[] | null = null;
  if (row.attachments && Array.isArray(row.attachments)) {
    attachments = row.attachments as Record<string, unknown>[];
  }

  let tags: string[] | null = null;
  if (row.tags && Array.isArray(row.tags)) {
    tags = row.tags as string[];
  }

  let satisfactionRating:
    | "very_dissatisfied"
    | "dissatisfied"
    | "neutral"
    | "satisfied"
    | "very_satisfied"
    | undefined;
  if (row.satisfactionRating) {
    satisfactionRating = row.satisfactionRating as any;
  }

  const complaintWithCorrectTypes = {
    ...row,
    attachments,
    tags,
    satisfactionRating,
  };

  const activity = [
    {
      id: 1,
      action: "Profile Viewed",
      description: "Complaint profile was accessed",
      timestamp: new Date(),
      type: "view" as const,
    },
  ];

  return {
    complaint: complaintWithCorrectTypes,
    submittedByUser: submittedByUser[0],
    assignedToUser: assignedToUser[0] || null,
    statistics: {
      isResolved: !!complaintWithCorrectTypes.resolvedAt,
      isClosed: !!complaintWithCorrectTypes.closedAt,
      isArchived: complaintWithCorrectTypes.isArchived,
    },
    activity,
  };
}
