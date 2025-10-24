import type {
  Action,
  Attribute,
  Resource,
} from "@/lib/Authorization/core/types";
import { Cache } from "@/lib/Authorization/utils/cache";
import { PolicyManager } from "../abac/policy-manager";
import { RoleManager } from "../rbac/role-manager";

export class AccessControl {
  private readonly roleManager = new RoleManager();
  private readonly policyManager = new PolicyManager();
  private readonly cache = new Cache<boolean>();

  async hasPermission(
    userId: string,
    resource: Resource,
    action: Action,
    contextAttributes: Attribute[] = [],
  ): Promise<boolean> {
    const cacheKey = `perm:${userId}:${resource}:${action}:${JSON.stringify(contextAttributes)}`;
    const cached = this.cache.get(cacheKey);
    if (cached !== null) return cached;

    const rbacAllowed = await this.roleManager.checkUserPermission(
      userId,
      resource,
      action,
    );
    const abacAllowed = await this.policyManager.checkAccess(
      userId,
      resource,
      action,
      contextAttributes,
    );

    const allowed = rbacAllowed && abacAllowed;
    this.cache.set(cacheKey, allowed, 60_000);
    return allowed;
  }
}

// Singleton
let accessControlInstance: AccessControl | null = null;
export function getAccessControl(): AccessControl {
  if (!accessControlInstance) {
    accessControlInstance = new AccessControl();
  }
  return accessControlInstance;
}
