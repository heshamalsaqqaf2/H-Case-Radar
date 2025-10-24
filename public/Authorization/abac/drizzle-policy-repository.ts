// src/lib/authorization/abac/drizzle-policy-repository.ts

import { eq } from "drizzle-orm";
import type { Policy } from "@/lib/Authorization/core/types";
import { database } from "@/lib/database";
import { policies } from "@/lib/database/schema";

function mapDrizzlePolicyToPolicy(row: any): Policy {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    effect: row.effect as "ALLOW" | "DENY",
    rules: Array.isArray(row.rules) ? row.rules : [],
    createdAt: row.createdAt ?? new Date(),
    updatedAt: row.updatedAt ?? new Date(),
  };
}

export class DrizzlePolicyRepository {
  async findAllPolicies(): Promise<Policy[]> {
    const result = await database.select().from(policies);
    return result.map(mapDrizzlePolicyToPolicy);
  }

  async createPolicy(policy: Omit<Policy, "id">): Promise<Policy> {
    const id = `policy_${Date.now()}`;
    const [newPolicy] = await database
      .insert(policies)
      .values({
        id,
        name: policy.name,
        description: policy.description,
        effect: policy.effect,
        rules: policy.rules,
      })
      .returning();
    return mapDrizzlePolicyToPolicy(newPolicy);
  }

  async updatePolicy(id: string, updates: Partial<Policy>): Promise<Policy> {
    const [updated] = await database
      .update(policies)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(policies.id, id))
      .returning();
    return mapDrizzlePolicyToPolicy(updated);
  }

  async deletePolicy(id: string): Promise<void> {
    await database.delete(policies).where(eq(policies.id, id));
  }
}
