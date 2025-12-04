/** biome-ignore-all lint/complexity/noStaticOnlyClass: <> */
import { inArray } from "drizzle-orm";
import { UserComplaintsRepo } from "@/lib/complaints/repositories/user-complaints-repo";
import type { ComplaintSummary } from "@/lib/complaints/types/type-complaints";
import { user as userTable } from "@/lib/database/index";
import { database as db } from "@/lib/database/server";

export class UserComplaintService {
  static async getUserAssignedComplaints(
    userId: string,
    pageSize = 10,
    cursor?: string,
  ) {
    const result = await UserComplaintsRepo.getAssignedComplaints(userId, {
      pageSize,
      cursor,
    });

    // Bulk user lookup for all items
    const userIds = Array.from(
      new Set(
        result.items.flatMap((c) => [c.assignedTo, c.submittedBy]).filter((x): x is string => !!x),
      ),
    );

    const users = await db
      .select({ id: userTable.id, name: userTable.name, email: userTable.email })
      .from(userTable)
      .where(inArray(userTable.id, userIds));

    const usersMap = new Map(users.map((user) => [user.id, user]));

    const enhancedItems = result.items.map((c) => ({
      ...c,
      assignedUserName: c.assignedTo ? usersMap.get(c.assignedTo)?.name || "" : "",
      submittedByUserName: usersMap.get(c.submittedBy)?.name || "",
      hasAttachments: false, // Default for summary
      commentCount: 0, // Default for summary
    }));

    return {
      items: enhancedItems as ComplaintSummary[],
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    };
  }
}
