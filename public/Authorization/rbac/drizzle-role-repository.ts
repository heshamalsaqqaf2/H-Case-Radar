import { and, eq } from "drizzle-orm";
import type { Role } from "@/lib/Authorization/core/types";
import { database } from "@/lib/database";
import { roles, userRoles } from "@/lib/database/schema";

function mapDrizzleRoleToRole(row: any): Role {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    permissions: Array.isArray(row.permissions) ? row.permissions : [],
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
  };
}

export class DrizzleRoleRepository {
  async findUserRoles(userId: string): Promise<Role[]> {
    const result = await database
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));
    return result.map((row) => mapDrizzleRoleToRole(row.roles));
  }

  async findAllRoles(): Promise<Role[]> {
    const result = await database.select().from(roles);
    return result.map(mapDrizzleRoleToRole);
  }

  async createRole(role: Omit<Role, "id">): Promise<Role> {
    const id = `role_${Date.now()}`;
    const [newRole] = await database
      .insert(roles)
      .values({
        id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      })
      .returning();
    return mapDrizzleRoleToRole(newRole);
  }

  async updateRole(id: string, updates: Partial<Role>): Promise<Role> {
    const [updated] = await database
      .update(roles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    return mapDrizzleRoleToRole(updated);
  }

  async deleteRole(id: string): Promise<void> {
    await database.delete(roles).where(eq(roles.id, id));
  }
}
