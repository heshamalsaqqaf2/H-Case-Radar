import type { Role } from "@/lib/Authorization/core/types";

export interface RoleRepository {
  findUserRoles(userId: string): Promise<Role[]>;
}
