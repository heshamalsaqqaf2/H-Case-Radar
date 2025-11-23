// Status Management
export type ComplaintStatus =
  | "open" // مفتوحة
  | "in_progress" // قيد التنفيذ
  | "resolved" // تم الحل
  | "closed" // مغلقة (ممكن حل أو بدون حل)
  | "unresolved" // لم تحل (حالة فرعية لـ closed)
  | "escalated" // تم تصعيدها
  | "on_hold" // معلقة
  | "reopened"; // أُعيد فتحها

// Activity Management
export type ComplaintActivityType =
  | "create"
  | "update"
  | "assign"
  | "resolve"
  | "close"
  | "comment"
  | "reassign"
  | "escalate";

// Satisfaction Management
export type ComplaintSatisfactionRatingType =
  | "very_dissatisfied"
  | "dissatisfied"
  | "neutral"
  | "satisfied"
  | "very_satisfied"
  | null;

// Priority Management
export type ComplaintPriorityType = "low" | "medium" | "high" | "critical";
// Source Management
export type ComplaintSourceType = "web_form" | "email" | "phone" | "mobile_app" | "api";
// Escalation Management
export type ComplaintEscalationLevelType = "none" | "level_1" | "level_2" | "level_3";

// export type complaintComments;

// Start OF Complaint Types
export type ComplaintWithUserDetails = {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: ComplaintPriorityType;
  category: string;
  assignedTo: string | null;
  submittedBy: string;
  attachments: string[] | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  closedAt: Date | null;
  closedBy: string | null;
  lastActivityAt: Date;
  source: ComplaintSourceType;
  tags: string[] | null;
  escalationLevel: ComplaintEscalationLevelType;
  satisfactionRating: ComplaintSatisfactionRatingType;
  responseDueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isArchived: boolean;
  archivedAt: Date | null;
  archivedBy: string | null;
  assignedUserName: string;
  assignedUserEmail: string;
  submittedByUserName: string;
  submittedByUserEmail: string;
  isUrgent: boolean; // هل الشكوى عاجلة؟
  expectedResolutionDate: Date | null; // تاريخ التسليم المتوقع
  actualResolutionTime: number | null; // الوقت الفعلي للحل (بالساعات)
  isReopened: boolean; // هل تمت إعادة فتحها؟
  reopenCount: number; // عدد مرات إعادة الفتح
  reopenReason: string | null; // سبب الإعادة الفتح
  // comments: (typeof complaintsTable.$inferSelect)[];
  // activity: (typeof activityTable.$inferSelect)[];
};

export type ComplaintSummary = {
  id: string;
  title: string;
  status: ComplaintStatus;
  priority: ComplaintPriorityType;
  category: string;
  assignedTo: string | null;
  submittedBy: string;
  createdAt: Date;
  lastActivityAt: Date;
  assignedUserName: string;
  submittedByUserName: string;
  isUrgent: boolean;
  hasAttachments: boolean;
  commentCount: number;
};

export type ComplaintProfileData = {
  complaint: ComplaintWithUserDetails;
  statistics: {
    totalComments: number;
    responseTime: number; // hours - الوقت من الإنشاء إلى أول تفاعل
    resolutionTime: number; // hours - الوقت من الإنشاء إلى الحل
    totalTime: number; // hours - الوقت الكلي في النظام
    reopenCount: number;
    satisfactionScore: number | null; // متوسط التقييم
  };
  activity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: Date;
    type: ComplaintActivityType;
    actorName: string | null;
  }>;
  timeline: Array<{
    status: ComplaintStatus;
    timestamp: Date;
    notes: string | null;
    actor: string | null;
  }>;
};

export type ComplaintStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  unresolved: number; // ✅ جديد
  escalated: number; // ✅ جديد
  onHold: number; // ✅ جديد
  reopened: number; // ✅ جديد
  overdue: number;
  highPriority: number;
  urgent: number; // ✅ جديد
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<ComplaintStatus, number>; // ✅ محسّن
  byAssignee: Record<string, number>; // ✅ جديد
  bySource: Record<string, number>;
  avgResolutionTime: number; // hours
  satisfactionRate: number; // percentage
};

export type CreateComplaintInput = {
  title: string;
  description: string;
  assignedTo: string;
  priority: ComplaintPriorityType;
  source?: ComplaintSourceType;
  escalationLevel?: ComplaintEscalationLevelType;
  category: string;
  isUrgent?: boolean;
  tags?: string[];
  attachments?: string[];
  responseDueAt?: Date;
  expectedResolutionDate?: Date;
};

export type UpdateComplaintInput = {
  id: string;
  title?: string;
  description?: string;
  status?: ComplaintStatus;
  priority?: ComplaintPriorityType;
  category?: string;
  assignedTo?: string | null;
  resolutionNotes?: string;
  tags?: string[];
  escalationLevel?: ComplaintEscalationLevelType;
  satisfactionRating?: ComplaintSatisfactionRatingType;
  responseDueAt?: Date | null;
  expectedResolutionDate?: Date | null;
  isUrgent?: boolean;
  reopenReason?: string;
  reopenCount?: number;
  isReopened?: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  closedAt?: Date | null;
  closedBy?: string | null;
  source?: ComplaintSourceType;
  attachments?: string[];
};
