// src/lib/authorization/hooks/admin/index.ts

// --- Permissions ---
export {
  useCreatePermission,
  useDeletePermission,
  usePermission,
  usePermissions,
  useUpdatePermission,
} from "./use-permissions";

// --- Roles ---
export {
  useAssignPermissionsToRole,
  useCreateRole,
  useDeleteRole,
  useRoleProfile,
  useUpdateRole,
} from "./use-roles";

// --- Users ---
export {
  useAssignRoleToUser,
  useRemoveRoleFromUser,
  useUsers,
} from "./use-users";
