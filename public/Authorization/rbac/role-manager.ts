// src/lib/authorization/rbac/role-manager.ts

import type { Action, Resource } from "../core/types";
import { InMemoryRoleRepository, type RoleRepository } from "./role-repository";

export class RoleManager {
  private readonly repo: RoleRepository;

  // افتراضيًا نستخدم التنفيذ في الذاكرة (قابل للاستبدال)
  constructor(repo?: RoleRepository) {
    this.repo = repo ?? new InMemoryRoleRepository();
  }

  async checkUserPermission(
    userId: string,
    resource: Resource,
    action: Action,
  ): Promise<boolean> {
    const roles = await this.repo.findUserRoles(userId);
    return roles.some((role) =>
      role.permissions.some(
        (p) =>
          p.resource === resource && (p.action === action || p.action === "*"),
      ),
    );
  }
}
