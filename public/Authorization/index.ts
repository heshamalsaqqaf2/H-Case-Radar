import type { Policy, Role } from "@/lib/authorization/core/types";
import { InMemoryPolicyRepository } from "./abac/policy-repository";
import { AccessControl } from "./core/access-control";
import { InMemoryRoleRepository } from "./rbac/role-repository";

// مثيل عالمي (Singleton)
let accessControlInstance: AccessControl | null = null;

export function getAccessControl(): AccessControl {
  if (!accessControlInstance) {
    accessControlInstance = new AccessControl();
  }
  return accessControlInstance;
}

// دالة لتهيئة النظام (تُستخدم في وقت التشغيل)
export async function initializeAuthorizationSystem(): Promise<void> {
  const roleRepo = new InMemoryRoleRepository();
  const policyRepo = new InMemoryPolicyRepository();

  // === تهيئة الأدوار ===
  const adminRole: Role = {
    id: "role_admin",
    name: "admin",
    description: "Full system access",
    permissions: [
      { resource: "users", action: "*" },
      { resource: "dashboard", action: "view" },
      { resource: "settings", action: "manage" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const editorRole: Role = {
    id: "role_editor",
    name: "editor",
    description: "Content management",
    permissions: [
      { resource: "content", action: "*" },
      { resource: "users", action: "view" },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // تعيين أدوار تجريبية للمستخدمين
  roleRepo.assignRoles("user_123", [adminRole]);
  roleRepo.assignRoles("user_456", [editorRole]);

  // === تهيئة السياسات (ABAC) ===
  const workHoursPolicy: Policy = {
    id: "policy_work_hours",
    name: "Work Hours Access",
    description: "Allow access only during work hours (8 AM - 6 PM)",
    effect: "DENY",
    rules: [
      {
        condition: "AND",
        conditions: [
          { attribute: "time.hour", operator: "<", value: 8 },
          { attribute: "time.hour", operator: ">", value: 18 },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  policyRepo.addPolicy(workHoursPolicy);

  // يمكنك هنا حقن الـ repositories في الـ managers إذا أردت
  // لكننا نعتمد على الافتراضي في هذه النسخة البسيطة
}
