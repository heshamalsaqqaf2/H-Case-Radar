// src/lib/authorization/types/user.ts
export interface BaseUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // role: string | null; // من Better Auth
}

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean | null;
}

export interface UserPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string | null;
  conditions: Record<string, unknown> | null;
}

export interface UserWithRoles extends BaseUser {
  roles: UserRole[];
}

export interface UserWithRolesAndPermissions extends BaseUser {
  roles: UserRole[];
  permissions: UserPermission[];
}

export interface UserProfile extends BaseUser {
  roles: UserRole[];
  permissions: UserPermission[];
  statistics: {
    rolesCount: number;
    permissionsCount: number;
    lastActivity?: Date;
    loginCount?: number;
  };
}

// أنواع للإدخال
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  banned?: boolean | null;
  banReason?: string | null;
  roleIds?: string[];
}

// export interface UserWithRoles {
//   id: string;
//   name: string;
//   email: string;
//   createdAt: Date;
//   roles: {
//     id: string;
//     name: string;
//     description: string | null;
//   }[];
// }
