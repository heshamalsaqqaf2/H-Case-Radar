// src/lib/authorization/types/user.ts
// قم بتعديلها حتى تصبح احترافية ومعبرة بشدة بحيث يكون ملف انواع احترافي وقوي ومهم جدا جدا
// ارجوك ان تتمهل في تفكيرك وتعطيني نتائج احترافية وقوية ومن شخص خبير وفاهم ماهيا الامور الاحترافية
// وكيف عملها ولماذا يتم عملها وتطبق افضل الممارسات

// !تأكد أن BaseUser متوافق مع Better Auth
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

// ------------------------------------------------------
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  roleIds?: string[];
  sendWelcomeEmail?: boolean;
}
export interface UpdateUserInput {
  name?: string;
  email?: string;
  banned?: boolean | null;
  banReason?: string | null;
  roleIds?: string[];
}
export interface CreateUserResponse {
  user: BaseUser;
  temporaryPassword?: string;
  assignedRoles: UserRole[];
}

// ------------------------------------------------------
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
