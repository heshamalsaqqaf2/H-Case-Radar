export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "awaiting_response" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  assignedTo: string | null;
  submittedBy: string;
  attachments: Record<string, unknown>[] | null;
  resolutionNotes: string | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  closedAt: Date | null;
  closedBy: string | null;
  lastActivityAt: Date;
  source: "web_form" | "email" | "phone" | "mobile_app" | "api";
  tags: string[] | null;
  escalationLevel: "none" | "level_1" | "level_2" | "level_3";
  satisfactionRating?:
    | "very_dissatisfied"
    | "dissatisfied"
    | "neutral"
    | "satisfied"
    | "very_satisfied";
  responseDueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isArchived: boolean;
  archivedAt: Date | null;
  archivedBy: string | null;
}

export interface ComplaintWithUserDetails extends Complaint {
  submittedByUser: {
    id: string;
    name: string;
    email: string;
  };
  assignedToUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  resolvedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  closedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  archivedByUser: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ComplaintProfileData {
  complaint: Complaint;
  submittedByUser: {
    id: string;
    name: string;
    email: string;
  };
  assignedToUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  statistics: {
    isResolved: boolean;
    isClosed: boolean;
    isArchived: boolean;
  };
  activity: {
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: "user" | "complaint" | "system" | "view";
  }[];
}
