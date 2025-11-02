export interface RolePermission {
  permissionId: string;
  permissionName: string;
  resource: string;
  action: string;
}

export interface RoleProfileData {
  permissions: RolePermission[];
  role: {
    id: string;
    name: string;
    description: string | null;
    isDefault: boolean | null;
    createdAt: Date;
    updatedAt: Date;
  };
  users: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    assignedAt: Date;
  }[];
  statistics: {
    usersCount: number;
    permissionsCount: number;
  };
  activity: {
    id: number;
    action: string;
    description: string;
    timestamp: Date;
    type: "user" | "permission" | "system" | "view";
  }[];
}
