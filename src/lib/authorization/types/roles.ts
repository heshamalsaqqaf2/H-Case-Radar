// src/lib/authorization/types/roles.ts
export interface Role {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  permissionId: string;
  permissionName: string;
  permissionDescription: string | null;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
  conditions: Record<string, unknown> | null;
}

export interface RoleWithPermissions extends Role {
  permissions: Permission[];
}

export interface RoleWithUserCount extends Role {
  userCount: number;
}

export interface UserRoleAssignment {
  userId: string;
  userName: string;
  userEmail: string;
  userCreatedAt: Date;
  assignedAt: Date;
}

export interface RoleProfileData {
  role: Role;
  users: UserRoleAssignment[];
  permissions: Permission[];
  statistics: {
    usersCount: number;
    permissionsCount: number;
  };
  activity: Array<{
    id: string;
    action: string;
    description: string;
    timestamp: Date;
    type: "view" | "create" | "update" | "delete";
  }>;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  isDefault?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  isDefault?: boolean;
  permissionIds?: string[];
}
