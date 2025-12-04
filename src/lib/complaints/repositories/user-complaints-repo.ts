import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { complaints } from "@/lib/database/schema/complaints-schema";
import { database as db } from "@/lib/database/server";

/**
 * Keyset pagination cursor format:
 *   cursor = base64(JSON.stringify({ createdAt: '<iso>', id: '<uuid>' }))
 */

function decodeCursor(cursor?: string): { createdAt: string; id: string } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: createdAt.toISOString(),
      id,
    }),
  ).toString("base64");
}

export const UserComplaintsRepo = {
  /**
   * Get complaints assigned to a specific user with pagination
   */
  async getAssignedComplaints(
    userId: string,
    params: {
      pageSize?: number;
      cursor?: string;
    } = {},
  ) {
    const { pageSize = 10, cursor } = params;
    const decoded = decodeCursor(cursor);
    const conditions: SQL[] = [eq(complaints.assignedTo, userId)];

    // Cursor pagination filter
    if (decoded) {
      const cursorDate = new Date(decoded.createdAt);
      const paginationCondition = or(
        sql`${complaints.createdAt} < ${cursorDate}`,
        and(sql`${complaints.createdAt} = ${cursorDate}`, sql`${complaints.id} < ${decoded.id}`),
      );
      if (paginationCondition !== undefined) {
        conditions.push(paginationCondition);
      }
    }

    const whereClause = and(...conditions);

    const query = db
      .select({
        id: complaints.id,
        title: complaints.title,
        status: complaints.status,
        priority: complaints.priority,
        category: complaints.category,
        assignedTo: complaints.assignedTo,
        submittedBy: complaints.submittedBy,
        createdAt: complaints.createdAt,
        lastActivityAt: complaints.lastActivityAt,
        isUrgent: complaints.isUrgent,
      })
      .from(complaints)
      .where(whereClause)
      .orderBy(desc(complaints.createdAt), desc(complaints.id))
      .limit(pageSize + 1);

    try {
      const rows = await query;
      const hasNext = rows.length > pageSize;
      const pageRows = rows.slice(0, pageSize);

      const nextCursor =
        hasNext && pageRows.length > 0
          ? encodeCursor(pageRows[pageRows.length - 1].createdAt, pageRows[pageRows.length - 1].id)
          : null;

      return {
        items: pageRows,
        nextCursor,
        hasNext,
      };
    } catch (error) {
      console.error("Error in UserComplaintsRepo.getAssignedComplaints:", error);
      throw new Error("Failed to fetch user assigned complaints");
    }
  },
};
