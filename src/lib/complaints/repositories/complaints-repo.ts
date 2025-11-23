import { and, desc, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import { complaints, complaintTags, tags } from "@/lib/database/schema/complaints-schema";
import { database as db } from "@/lib/database/server";

/**
 * Keyset pagination cursor format:
 *   cursor = base64(JSON.stringify({ createdAt: '<iso>', id: '<uuid>' }))
 *
 * We'll sort by createdAt DESC, id DESC for stable ordering.
 */

/**
 * Decodes a base64 cursor into its components
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

/**
 * Encodes cursor data into a base64 string
 */
function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({
      createdAt: createdAt.toISOString(),
      id,
    }),
  ).toString("base64");
}

/**
 * Builds SQL conditions from array elements
 */
function buildInCondition<T, C extends { [K: string]: any }>(
  column: C[keyof C],
  values: readonly T[],
): SQL | undefined {
  if (values.length === 0) return undefined;
  if (values.length === 1) {
    return eq(column as any, values[0]);
  }
  return sql`${column as any} IN (${sql.join(
    values.map(() => sql`?`),
    sql`, `,
  )})`;
}

/**
 * Repository class for complaints operations with improved error handling and type safety
 */
export const ComplaintsRepo = {
  /**
   * Create a new complaint
   */
  async create(values: typeof complaints.$inferInsert) {
    const now = new Date();
    const [row] = await db
      .insert(complaints)
      .values({
        ...values,
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
      })
      .returning();
    return row;
  },

  /**
   * Update an existing complaint
   */
  async update(id: string, patch: Partial<typeof complaints.$inferInsert>) {
    const now = new Date();
    const [row] = await db
      .update(complaints)
      .set({
        ...patch,
        updatedAt: now,
        lastActivityAt: now,
      })
      .where(eq(complaints.id, id))
      .returning();
    return row;
  },

  /**
   * Delete a complaint
   */
  async delete(id: string) {
    const [row] = await db.delete(complaints).where(eq(complaints.id, id)).returning();
    return row;
  },

  /**
   * Find a complaint by ID
   */
  async findById(id: string) {
    const rows = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    return rows[0] ?? null;
  },

  /**
   * Get total count of all complaints
   */
  async countAll() {
    const [r] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(complaints);
    return r.count;
  },

  /**
   * Advanced list with filtering, search, and pagination
   */
  async listAdvanced(
    params: {
      search?: string;
      status?: string;
      priority?: string;
      category?: string;
      tagNames?: string[]; // filter by tag names (AND)
      pageSize?: number;
      cursor?: string; // keyset cursor
      includeArchived?: boolean;
    } = {},
  ) {
    const { search, status, priority, category, tagNames, pageSize = 10, cursor, includeArchived } = params;

    const decoded = decodeCursor(cursor);
    const conditions: SQL[] = [];

    // Search filter
    if (search?.trim()) {
      const searchPattern = `%${search.trim()}%`;
      const searchCondition = or(
        ilike(complaints.title, searchPattern),
        ilike(complaints.description, searchPattern),
      );

      if (searchCondition !== undefined) {
        conditions.push(searchCondition);
      }
    }

    // Status filter
    if (status) {
      conditions.push(eq(complaints.status, status));
    }

    // Priority filter
    if (priority) {
      conditions.push(eq(complaints.priority, priority));
    }

    // Category filter
    if (category) {
      conditions.push(eq(complaints.category, category));
    }

    // Archived filter
    if (!includeArchived) {
      conditions.push(eq(complaints.isArchived, false)); // أو isNull(complaints.archivedAt) حسب بنية جدولك
    }

    // Cursor pagination filter
    if (decoded) {
      const cursorDate = new Date(decoded.createdAt);
      const paginationCondition = or(
        sql`${complaints.createdAt} < ${cursorDate}`,
        and(sql`${complaints.createdAt} = ${cursorDate}`, sql`${complaints.id} < ${decoded.id}`),
      );
      if (decoded && paginationCondition !== undefined) {
        conditions.push(paginationCondition);
      }
    }

    // Tag filter - handle separately for complex query
    let finalConditions = conditions;
    let tagFilteredIds: string[] | null = null;

    if (tagNames && tagNames.length > 0) {
      const normalizedTagNames = tagNames.map((t) => t.toLowerCase());

      // Create a safe tag subquery
      const tagSubquery = db
        .select({
          complaintId: complaintTags.complaintId,
        })
        .from(complaintTags)
        .innerJoin(tags, eq(complaintTags.tagId, tags.id))
        .where(
          sql`lower(${tags.name}) IN (${sql.join(
            normalizedTagNames.map(() => sql`?`),
            sql`, `,
          )})`,
        )
        .groupBy(complaintTags.complaintId)
        .having(sql`count(distinct ${tags.name}) = ${normalizedTagNames.length}`);

      const tagResults = await tagSubquery;
      tagFilteredIds = tagResults.map((r) => r.complaintId);

      if (tagFilteredIds.length === 0) {
        // No complaints match all tags, return empty result
        return {
          items: [],
          nextCursor: null,
          hasNext: false,
        };
      }

      // Add tag filter condition
      const tagCondition = buildInCondition(complaints.id, tagFilteredIds);
      if (tagCondition) {
        finalConditions = [...conditions, tagCondition];
      }
    }

    // Build the final query
    const whereClause =
      finalConditions.length > 0
        ? finalConditions.length === 1
          ? finalConditions[0]
          : and(...finalConditions)
        : undefined;

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
      })
      .from(complaints)
      .where(whereClause)
      .orderBy(desc(complaints.createdAt), desc(complaints.id))
      .limit(pageSize + 1); // fetch one more to determine hasNext

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
      console.error("Error in listAdvanced:", error);
      throw new Error("Failed to fetch complaints");
    }
  },

  /**
   * Get complaints by tag names (convenience method)
   */
  async getByTags(tagNames: string[], limit = 20) {
    return this.listAdvanced({ tagNames, pageSize: limit });
  },

  /**
   * Get complaints by status (convenience method)
   */
  async getByStatus(status: string, limit = 20) {
    return this.listAdvanced({ status, pageSize: limit });
  },

  /**
   * Search complaints (convenience method)
   */
  async search(searchTerm: string, limit = 20) {
    return this.listAdvanced({ search: searchTerm, pageSize: limit });
  },
};

// Type exports for better type safety
export type ComplaintCreateInput = typeof complaints.$inferInsert;
export type ComplaintUpdateInput = Partial<typeof complaints.$inferInsert>;
export type ComplaintListParams = Parameters<typeof ComplaintsRepo.listAdvanced>[0];
export type ComplaintListResult = Awaited<ReturnType<typeof ComplaintsRepo.listAdvanced>>;
