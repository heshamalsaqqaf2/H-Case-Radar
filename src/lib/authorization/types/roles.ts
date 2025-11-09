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

// // src/lib/authorization/types/roles.ts
// export interface Role {
//   id: string;
//   name: string;
//   description: string | null;
//   isDefault: boolean | null;
//   userCount: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface RolePermission {
//   permissionId: string;
//   permissionName: string;
//   resource: string;
//   action: string;
// }

// export interface RoleProfileData {
//   role: Role;
//   users: Array<{
//     id: string;
//     name: string;
//     email: string;
//     createdAt: Date;
//     assignedAt: Date;
//   }>;
//   permissions: RolePermission[];
//   statistics: {
//     usersCount: number;
//     permissionsCount: number;
//   };
//   activity: Array<{
//     id: number;
//     action: string;
//     description: string;
//     timestamp: Date;
//     type: "view" | "create" | "update" | "delete";
//   }>;
// }

// export interface RolePermission {
//   permissionId: string;
//   permissionName: string;
//   resource: string;
//   action: string;
// }

// export interface RoleProfileData {
//   permissions: RolePermission[];
//   role: {
//     id: string;
//     name: string;
//     description: string | null;
//     isDefault: boolean | null;
//     createdAt: Date;
//     updatedAt: Date;
//   };
//   users: {
//     id: string;
//     name: string;
//     email: string;
//     createdAt: Date;
//     assignedAt: Date;
//   }[];
//   statistics: {
//     usersCount: number;
//     permissionsCount: number;
//   };
//   activity: {
//     id: number;
//     action: string;
//     description: string;
//     timestamp: Date;
//     type: "user" | "permission" | "system" | "view";
//   }[];
// }
