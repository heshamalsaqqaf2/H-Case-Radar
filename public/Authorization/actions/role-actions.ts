// src/lib/authorization/actions/role-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/authentication/session";
import { getAccessControl } from "../core/access-control";
import type { Role } from "../core/types";
import { DrizzleRoleRepository } from "../rbac/drizzle-role-repository";

async function requirePermission(resource: string, action: string) {
  const user = await getCurrentUser();
  const ac = getAccessControl();
  const hasAccess = await ac.hasPermission(user.id, resource, action);
  if (!hasAccess) throw new Error("Unauthorized");
  return user;
}

export async function getAllRoles() {
  await requirePermission("roles", "read");
  const repo = new DrizzleRoleRepository();
  return await repo.findAllRoles();
}

// ✅ نفس التصحيح هنا
export async function createRole(
  data: Omit<Role, "id">, // ← اسم المعلمة: data
) {
  await requirePermission("roles", "create");
  const repo = new DrizzleRoleRepository();
  const role = await repo.createRole(data); // ← استخدام "data"
  revalidatePath("/permissions/roles");
  return { success: true, role };
}

export async function updateRole(input: {
  id: string;
  updates: Partial<Role>;
}) {
  await requirePermission("roles", "update");
  const repo = new DrizzleRoleRepository();
  const role = await repo.updateRole(input.id, input.updates);
  revalidatePath("/permissions/roles");
  return { success: true, role };
}

export async function deleteRole(id: string) {
  await requirePermission("roles", "delete");
  const repo = new DrizzleRoleRepository();
  await repo.deleteRole(id);
  revalidatePath("/permissions/roles");
  return { success: true };
}
