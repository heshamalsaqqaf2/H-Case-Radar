// src/lib/complaints/types/type-complaints.ts
import type { InferSelectModel } from "drizzle-orm";
import type { complaint } from "@/lib/database/schema";

// --- Core Types ---
export type Complaint = InferSelectModel<typeof complaint>;

export type ComplaintWithUserDetails = {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "awaiting_response" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
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
  source: "web_form" | "email" | "phone" | "mobile_app" | "api";
  tags: string[] | null;
  escalationLevel: "none" | "level_1" | "level_2" | "level_3";
  satisfactionRating:
    | "very_dissatisfied"
    | "dissatisfied"
    | "neutral"
    | "satisfied"
    | "very_satisfied"
    | null;
  responseDueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isArchived: boolean;
  archivedAt: Date | null;
  archivedBy: string | null;
  assignedUserName: string | null;
  assignedUserEmail: string | null;
  submittedByUserName: string;
  submittedByUserEmail: string;
};

export type ComplaintSummary = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string | null;
  submittedBy: string;
  createdAt: Date;
  lastActivityAt: Date;
  assignedUserName: string | null;
  submittedByUserName: string;
};

export type ComplaintProfileData = {
  complaint: ComplaintWithUserDetails;
  statistics: {
    totalComments: number;
    responseTime: number; // بالساعات
    resolutionTime: number; // بالساعات
  };
  activity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: Date;
    type: "view" | "update" | "assign" | "resolve" | "close";
  }>;
};

export type ComplaintStats = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  overdue: number;
  highPriority: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
};

// --- Input Types ---
export type CreateComplaintInput = {
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  source?: "web_form" | "email" | "phone" | "mobile_app" | "api";
  tags?: string[];
  attachments?: string[];
  assignedTo?: string;
};

export type UpdateComplaintInput = {
  id: string;
  title?: string;
  description?: string;
  status?: "open" | "in_progress" | "awaiting_response" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "critical";
  category?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  tags?: string[];
  escalationLevel?: "none" | "level_1" | "level_2" | "level_3";
  satisfactionRating?: "very_dissatisfied" | "dissatisfied" | "neutral" | "satisfied" | "very_satisfied";
  responseDueAt?: Date;
};
