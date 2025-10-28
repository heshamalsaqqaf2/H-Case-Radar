// src/lib/authorization/actions/policy-actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/authentication/session";
import { DrizzlePolicyRepository } from "../abac/drizzle-policy-repository";
import { getAccessControl } from "../core/access-control";
import type { Policy } from "../core/types";

async function requirePermission(resource: string, action: string) {
  const user = await getCurrentUser();
  const ac = getAccessControl();
  const hasAccess = await ac.hasPermission(user.id, resource, action);
  if (!hasAccess) throw new Error("Unauthorized");
  return user;
}

// ✅ التصحيح: تعريف المعلمة بشكل صحيح مع النوع
export async function getAllPolicies() {
  await requirePermission("policies", "read");
  const repo = new DrizzlePolicyRepository();
  return await repo.findAllPolicies();
}

// ✅ التصحيح: المعلمة يجب أن يكون لها اسم + نوع
export async function createPolicy(
  data: Omit<Policy, "id">, // ← اسم المعلمة: data، النوع: Omit<Policy, "id">
) {
  const user = await requirePermission("policies", "create");
  const repo = new DrizzlePolicyRepository();
  const policy = await repo.createPolicy(data); // ← استخدام "data" وليس "Omit"
  revalidatePath("/permissions/policies");
  return { success: true, policy };
}

export async function updatePolicy(
  input: { id: string; updates: Partial<Policy> }, // ← اسم المعلمة: input
) {
  await requirePermission("policies", "update");
  const repo = new DrizzlePolicyRepository();
  const policy = await repo.updatePolicy(input.id, input.updates);
  revalidatePath("/permissions/policies");
  return { success: true, policy };
}

export async function deletePolicy(id: string) {
  await requirePermission("policies", "delete");
  const repo = new DrizzlePolicyRepository();
  await repo.deletePolicy(id);
  revalidatePath("/permissions/policies");
  return { success: true };
}
