// // lib/actions/role-actions.ts

// "use server";

// import { and, eq, not, sql } from "drizzle-orm";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";
// import { database as db } from "@/lib/database/index";
// import {
//   permission,
//   role,
//   rolePermissions,
//   user,
//   userRoles,
// } from "@/lib/database/schema";

// export interface RolePermission {
//   permissionId: string;
//   permissionName: string;
//   resource: string;
//   action: string;
// }

// interface RoleProfileData {
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
//   permissions: RolePermission[];
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

// // Schemas للتحقق من الصحة
// const createRoleSchema = z.object({
//   name: z
//     .string()
//     .min(2)
//     .max(50)
//     .regex(
//       /^[a-zA-Z0-9_]+$/,
//       "Name can only contain letters, numbers and underscores",
//     ),
//   description: z.string().min(5).max(200),
//   isDefault: z.boolean().default(false),
// });

// const updateRoleSchema = createRoleSchema.extend({
//   id: z.string().uuid(),
// });

// // إنشاء دور جديد
// export async function createRole(formData: FormData) {
//   try {
//     const validatedData = createRoleSchema.parse({
//       name: formData.get("name"),
//       description: formData.get("description"),
//       isDefault: formData.get("isDefault") === "on",
//     });

//     const existingRole = await db
//       .select()
//       .from(role)
//       .where(eq(role.name, validatedData.name))
//       .limit(1);

//     if (existingRole.length > 0) {
//       return {
//         success: false,
//         message: "Role with this name already exists",
//       };
//     }

//     const newRole = await db.insert(role).values(validatedData).returning();

//     revalidatePath("/admin/roles");

//     return {
//       success: true,
//       message: "Role created successfully",
//       data: newRole[0],
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         message: error.issues[0].message || "Failed to create role",
//       };
//     }

//     console.error("Error creating role:", error);
//     return {
//       success: false,
//       message: "Failed to create role",
//     };
//   }
// }

// // تحديث دور
// export async function updateRole(formData: FormData) {
//   try {
//     const validatedData = updateRoleSchema.parse({
//       id: formData.get("id"),
//       name: formData.get("name"),
//       description: formData.get("description"),
//       isDefault: formData.get("isDefault") === "on",
//     });

//     // ✅ التصحيح: استخدام not(eq(...)) لتجنب التكرار
//     const conflictRole = await db
//       .select()
//       .from(role)
//       .where(
//         and(
//           eq(role.name, validatedData.name),
//           not(eq(role.id, validatedData.id)),
//         ),
//       )
//       .limit(1);

//     if (conflictRole.length > 0) {
//       return {
//         success: false,
//         message: "Another role with this name already exists",
//       };
//     }

//     const updatedRole = await db
//       .update(role)
//       .set({
//         name: validatedData.name,
//         description: validatedData.description,
//         isDefault: validatedData.isDefault,
//         updatedAt: new Date(),
//       })
//       .where(eq(role.id, validatedData.id))
//       .returning();

//     revalidatePath("/admin/roles");

//     return {
//       success: true,
//       message: "Role updated successfully",
//       data: updatedRole[0],
//     };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return {
//         success: false,
//         message: error.issues[0].message,
//       };
//     }

//     console.error("Error updating role:", error);
//     return {
//       success: false,
//       message: "Failed to update role",
//     };
//   }
// }

// // حذف دور
// export async function deleteRole(roleId: string) {
//   try {
//     const userRoleRelations = await db
//       .select()
//       .from(userRoles)
//       .where(eq(userRoles.roleId, roleId))
//       .limit(1);

//     if (userRoleRelations.length > 0) {
//       return {
//         success: false,
//         message: "Cannot delete role that is assigned to users",
//       };
//     }

//     await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
//     await db.delete(role).where(eq(role.id, roleId));
//     revalidatePath("/admin/roles");

//     return {
//       success: true,
//       message: "Role deleted successfully",
//     };
//   } catch (error) {
//     console.error("Error deleting role:", error);
//     return {
//       success: false,
//       message: "Failed to delete role",
//     };
//   }
// }

// // تعيين الصلاحيات للدور
// export async function assignPermissionsToRole(
//   roleId: string,
//   permissionIds: string[],
// ) {
//   try {
//     // ✅ التحقق من القيم المطلوبة
//     if (!roleId) {
//       return { success: false, message: "Role ID is required" };
//     }

//     if (!Array.isArray(permissionIds)) {
//       return { success: false, message: "Permission IDs must be an array" };
//     }

//     const validPermissionIds = permissionIds.filter(
//       (id) => typeof id === "string" && id.trim() !== "",
//     );
//     await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

//     if (validPermissionIds.length > 0) {
//       const rolePermissionValues = validPermissionIds.map((permissionId) => ({
//         roleId,
//         permissionId,
//       }));

//       await db.insert(rolePermissions).values(rolePermissionValues);
//     }

//     revalidatePath("/admin/roles");

//     return {
//       success: true,
//       message: "Permissions assigned successfully",
//     };
//   } catch (error) {
//     console.error("Error assigning permissions:", error);
//     return {
//       success: false,
//       message: "Failed to assign permissions",
//     };
//   }
// }

// // دالة موحدة لجلب ملف الدور كاملاً
// export async function getRoleProfileData(
//   roleId: string,
// ): Promise<RoleProfileData | null> {
//   try {
//     const [roleData, usersData, permissionsData, statistics] =
//       await Promise.all([
//         db
//           .select({
//             id: role.id,
//             name: role.name,
//             description: role.description,
//             isDefault: role.isDefault,
//             createdAt: role.createdAt,
//             updatedAt: role.updatedAt,
//           })
//           .from(role)
//           .where(eq(role.id, roleId))
//           .limit(1),

//         db
//           .select({
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             createdAt: user.createdAt,
//             assignedAt: userRoles.createdAt,
//           })
//           .from(userRoles)
//           .innerJoin(user, eq(userRoles.userId, user.id))
//           .where(eq(userRoles.roleId, roleId))
//           .orderBy(user.name)
//           .limit(50),

//         db
//           .select({
//             permissionId: permission.id,
//             permissionName: permission.name,
//             resource: permission.resource,
//             action: permission.action,
//           })
//           .from(rolePermissions)
//           .innerJoin(
//             permission,
//             eq(rolePermissions.permissionId, permission.id),
//           )
//           .where(eq(rolePermissions.roleId, roleId)),

//         db
//           .select({
//             usersCount: sql<number>`COUNT(DISTINCT ${userRoles.userId})`,
//             permissionsCount: sql<number>`COUNT(DISTINCT ${rolePermissions.permissionId})`,
//           })
//           .from(role)
//           .leftJoin(userRoles, eq(role.id, userRoles.roleId))
//           .leftJoin(rolePermissions, eq(role.id, rolePermissions.roleId))
//           .where(eq(role.id, roleId))
//           .groupBy(role.id)
//           .limit(1),
//       ]);

//     if (roleData.length === 0) {
//       return null;
//     }

//     const recentActivity = [
//       {
//         id: 1,
//         action: "Profile Viewed",
//         description: "Role profile was accessed",
//         timestamp: new Date(),
//         type: "view" as const,
//       },
//     ];

//     return {
//       role: roleData[0],
//       users: usersData,
//       permissions: permissionsData as RolePermission[],
//       statistics: statistics[0] || { usersCount: 0, permissionsCount: 0 },
//       activity: recentActivity,
//     };
//   } catch (error) {
//     console.error("Error getting role profile data:", error);
//     return null;
//   }
// }

// -----------------------------------------------------------------------

// // lib/actions/permission-actions.ts
// "use server";

// import { eq } from "drizzle-orm";
// import { revalidatePath } from "next/cache";
// import { z } from "zod";
// import { database as db } from "@/lib/database/index";
// import { permission, rolePermissions } from "@/lib/database/schema";
// import type { SafePermission } from "@/lib/types/permission";

// const createPermissionSchema = z.object({
//   name: z
//     .string()
//     .min(3)
//     .max(100)
//     .regex(/^[a-zA-Z0-9._-]+$/),
//   description: z.string().max(200).optional(),
//   resource: z.string().min(1),
//   action: z.string().min(1),
//   conditions: z.string().optional(), // JSON string
// });

// const updatePermissionSchema = z.object({
//   id: z.string().uuid("معرف الصلاحية غير صالح"),
//   name: z
//     .string()
//     .min(3)
//     .max(100)
//     .regex(/^[a-zA-Z0-9._-]+$/),
//   description: z.string().max(200).optional(),
//   resource: z.string().min(1),
//   action: z.string().min(1),
//   conditions: z.string().optional(), // JSON string
// });

// export async function createPermission(formData: FormData) {
//   try {
//     const validatedData = createPermissionSchema.parse({
//       name: formData.get("name"),
//       description: formData.get("description") || undefined,
//       resource: formData.get("resource"),
//       action: formData.get("action"),
//       conditions: formData.get("conditions") || undefined,
//     });

//     // التحقق من عدم تكرار الاسم
//     const existingPermission = await db
//       .select()
//       .from(permission)
//       .where(eq(permission.name, validatedData.name))
//       .limit(1);

//     if (existingPermission.length > 0) {
//       return { success: false, message: "إسم الصلاحية موجود بالفعل" };
//     }

//     // تحويل الـ conditions من نص إلى JSON
//     let parsedConditions: Record<string, unknown> | null = null;
//     if (validatedData.conditions) {
//       parsedConditions = JSON.parse(validatedData.conditions);
//     }

//     await db.insert(permission).values({
//       name: validatedData.name,
//       description: validatedData.description || null,
//       resource: validatedData.resource,
//       action: validatedData.action,
//       conditions: parsedConditions,
//     });

//     revalidatePath("/admin/permissions");

//     return { success: true, message: "تم إنشاء الصلاحية بنجاح" };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, message: error.issues[0].message };
//     }
//     if (error instanceof SyntaxError) {
//       return {
//         success: false,
//         message:
//           "بيانات غير صالحة في الشروط والأحكام, يرجى التحقق من بيانات الشروط JSON",
//       };
//     }
//     console.error("Error creating permission:", error);
//     return { success: false, message: "فشل إنشاء الصلاحية" };
//   }
// }

// export async function deletePermission(permissionId: string) {
//   try {
//     // التحقق مما إذا كانت الصلاحية مرتبطة بدور
//     const rolePermissionRelations = await db
//       .select()
//       .from(permission)
//       .innerJoin(
//         rolePermissions,
//         eq(permission.id, rolePermissions.permissionId),
//       )
//       .where(eq(permission.id, permissionId))
//       .limit(1);

//     if (rolePermissionRelations.length > 0) {
//       return {
//         success: false,
//         message:
//           "لا يمكن حذف الصلاحية المخصصة الى الأدوار, يجب حذف الأدوار  المرتبطة بهذه الصلاحية اولا",
//         // message: "Cannot delete permission that is assigned to roles",
//       };
//     }

//     await db.delete(permission).where(eq(permission.id, permissionId));

//     revalidatePath("/admin/permissions");

//     return { success: true, message: "تم حذف الصلاحية بنجاح" };
//   } catch (error) {
//     console.error("حدث خطأ اثناء حذف الصلاحية, يرجى المحاولة مرة اخرى:", error);
//     return {
//       success: false,
//       message: "فشل حذف الصلاحية, يرجى المحاولة مرة اخرى",
//     };
//   }
// }

// export async function updatePermission(formData: FormData) {
//   try {
//     const validatedData = updatePermissionSchema.parse({
//       id: formData.get("id"),
//       name: formData.get("name"),
//       description: formData.get("description") || undefined,
//       resource: formData.get("resource"),
//       action: formData.get("action"),
//       conditions: formData.get("conditions") || undefined,
//     });

//     // ✅ التحقق من عدم وجود صلاحية أخرى بنفس الاسم (باستثناء هذه الصلاحية نفسها)
//     const existingPermission = await db
//       .select()
//       .from(permission)
//       .where(eq(permission.name, validatedData.name))
//       .limit(1);

//     if (
//       existingPermission.length > 0 &&
//       existingPermission[0].id !== validatedData.id
//     ) {
//       return {
//         success: false,
//         message: "اسم الصلاحية موجود بالفعل, يرجى تغيير الاسم",
//       };
//     }

//     // تحويل الـ conditions من نص إلى JSON
//     let parsedConditions: Record<string, unknown> | null = null;
//     if (validatedData.conditions) {
//       parsedConditions = JSON.parse(validatedData.conditions);
//     }

//     // تحديث الصلاحية
//     await db
//       .update(permission)
//       .set({
//         name: validatedData.name,
//         description: validatedData.description || null,
//         resource: validatedData.resource,
//         action: validatedData.action,
//         conditions: parsedConditions,
//         updatedAt: new Date(),
//       })
//       .where(eq(permission.id, validatedData.id));

//     revalidatePath("/admin/permissions");
//     return { success: true, message: "تم تحديث الصلاحية بنجاح" };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, message: error.issues[0].message };
//     }
//     if (error instanceof SyntaxError) {
//       return {
//         success: false,
//         message:
//           "بيانات غير صالحة في الشروط والأحكام, يرجى التحقق من بيانات الشروط JSON",
//       };
//     }
//     console.error("خطأ في تحديث الصلاحية:", error);
//     return {
//       success: false,
//       message: "فشل تحديث الصلاحية, يرجى المحاولة مرة اخرى",
//     };
//   }
// }

// export async function getPermissionById(
//   permissionId: string,
// ): Promise<SafePermission | null> {
//   try {
//     const result = await db
//       .select()
//       .from(permission)
//       .where(eq(permission.id, permissionId))
//       .limit(1);

//     if (result.length === 0) return null;

//     const raw = result[0];

//     // تحويل الـ conditions من unknown إلى Record<string, unknown> | null
//     const conditions =
//       typeof raw.conditions === "object" &&
//       raw.conditions !== null &&
//       !Array.isArray(raw.conditions)
//         ? (raw.conditions as Record<string, unknown>)
//         : null;

//     return {
//       id: raw.id,
//       name: raw.name,
//       description: raw.description,
//       resource: raw.resource,
//       action: raw.action,
//       conditions,
//       createdAt: raw.createdAt,
//       updatedAt: raw.updatedAt,
//     };
//   } catch (error) {
//     console.error("خطأ في الحصول على الصلاحية:", error);
//     return null;
//   }
// }
// -----------------------------------------------------------------------

// // lib/actions/admin-actions.ts
// "use server";

// import { and, eq } from "drizzle-orm";
// import { database as db } from "@/lib/database/index";
// import { permission, role, user, userRoles } from "@/lib/database/schema";

// interface UserWithRoles {
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

// export async function getUsersWithRoles(): Promise<UserWithRoles[]> {
//   try {
//     console.log("🔍 Getting users with roles...");

//     const allUsers = await db
//       .select({
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         createdAt: user.createdAt,
//       })
//       .from(user)
//       .orderBy(user.name);

//     const allUserRoles = await db
//       .select({
//         userId: userRoles.userId,
//         roleId: role.id,
//         roleName: role.name,
//         roleDescription: role.description,
//       })
//       .from(userRoles)
//       .innerJoin(role, eq(userRoles.roleId, role.id));

//     console.log(
//       `✅ Found ${allUsers.length} users and ${allUserRoles.length} role assignments`,
//     );

//     const userRoleMap = new Map<
//       string,
//       { id: string; name: string; description: string | null }[]
//     >();

//     allUserRoles.forEach((userRole) => {
//       if (!userRoleMap.has(userRole.userId)) {
//         userRoleMap.set(userRole.userId, []);
//       }
//       userRoleMap.get(userRole.userId)!.push({
//         id: userRole.roleId,
//         name: userRole.roleName,
//         description: userRole.roleDescription,
//       });
//     });

//     const usersWithRoles = allUsers.map((user) => ({
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       createdAt: user.createdAt,
//       roles: userRoleMap.get(user.id) || [],
//     }));

//     console.log(
//       `🎯 Successfully processed ${usersWithRoles.length} users with roles`,
//     );

//     return usersWithRoles;
//   } catch (error) {
//     console.error("❌ Error in getUsersWithRoles:", error);
//     return [];
//   }
// }

// export async function getAllRoles() {
//   try {
//     const roles = await db.select().from(role).orderBy(role.name);
//     console.log(`✅ Found ${roles.length} roles`);
//     return roles;
//   } catch (error) {
//     console.error("Error getting roles:", error);
//     return [];
//   }
// }

// export async function getAllPermissions() {
//   try {
//     const permissions = await db
//       .select()
//       .from(permission)
//       .orderBy(permission.resource, permission.action);
//     console.log(`✅ Found ${permissions.length} permissions`);
//     return permissions; // ← هذه المصفوفة من نوع Permission[]
//   } catch (error) {
//     console.error("Error getting permissions:", error);
//     return [];
//   }
// }

// export async function assignRoleToUser(userId: string, roleId: string) {
//   try {
//     console.log(`🔗 Assigning role ${roleId} to user ${userId}`);

//     const existingRelation = await db
//       .select()
//       .from(userRoles)
//       .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
//       .limit(1);

//     if (existingRelation.length > 0) {
//       console.log("ℹ️ User already has this role");
//       return { success: false, message: "User already has this role" };
//     }

//     await db.insert(userRoles).values({ userId, roleId });

//     console.log("✅ Role assigned successfully");
//     return { success: true, message: "Role assigned successfully" };
//   } catch (error) {
//     console.error("❌ Error assigning role:", error);
//     return { success: false, message: "Failed to assign role" };
//   }
// }

// export async function removeRoleFromUser(userId: string, roleId: string) {
//   try {
//     console.log(`🗑️ Removing role ${roleId} from user ${userId}`);

//     await db
//       .delete(userRoles)
//       .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

//     console.log("✅ Role removed successfully");
//     return { success: true, message: "Role removed successfully" };
//   } catch (error) {
//     console.error("❌ Error removing role:", error);
//     return { success: false, message: "Failed to remove role" };
//   }
// }

// -----------------------------------------------------------------------

// // lib/actions/auth-actions.ts
// "use server";

// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import {
//   authorizationService,
//   type SafePermission,
// } from "@/lib/authentication/permission-system";

// export async function getCurrentUser() {
//   try {
//     const headersList = await headers();
//     const cookieStore = await cookies();
//     const cookieString = cookieStore
//       .getAll()
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     const session = await auth.api.getSession({
//       headers: new Headers({
//         cookie: cookieString,
//         ...Object.fromEntries(headersList.entries()),
//       }),
//     });

//     return session?.user || null;
//   } catch (error) {
//     console.error("❌ Error in getCurrentUser:", error);
//     return null;
//   }
// }

// export async function getUserPermissions(
//   userId: string,
// ): Promise<SafePermission[]> {
//   try {
//     if (!userId) {
//       console.warn("getUserPermissions called with empty userId");
//       return [];
//     }
//     return await authorizationService.getUserPermissions(userId);
//   } catch (error) {
//     console.error("❌ Error getting user permissions:", error);
//     return [];
//   }
// }

// // lib/actions/auth-actions.ts
// "use server";

// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import { authorizationService } from "@/lib/authentication/permission-system";

// export async function getCurrentUser() {
//   try {
//     console.log("🔍 getCurrentUser called");

//     const headersList = await headers();
//     const cookieStore = await cookies();

//     const cookieString = cookieStore
//       .getAll()
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     console.log("📋 Cookies found:", cookieStore.getAll().length);

//     const session = await auth.api.getSession({
//       headers: new Headers({
//         cookie: cookieString,
//         ...Object.fromEntries(headersList.entries()),
//       }),
//     });

//     console.log("🎯 Session result:", {
//       hasSession: !!session,
//       hasUser: !!session?.user,
//       user: session?.user
//         ? {
//             id: session.user.id,
//             email: session.user.email,
//             name: session.user.name,
//           }
//         : null,
//     });

//     return session?.user || null;
//   } catch (error) {
//     console.error("❌ Error in getCurrentUser:", error);
//     return null;
//   }
// }

// export async function getUserPermissions(userId: string) {
//   try {
//     if (!userId) {
//       console.warn("getUserPermissions called with empty userId");
//       return [];
//     }

//     console.log("🔍 getUserPermissions called for user:", userId);
//     const permissions = await authorizationService.getUserPermissions(userId);
//     console.log("📋 Permissions found:", permissions.length);
//     return permissions;
//   } catch (error) {
//     console.error("❌ Error getting user permissions:", error);
//     return [];
//   }
// }

// -----------------------------------------------------------------------
// // lib/actions/auth-actions.ts
// "use server";

// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import {
//   authorizationService,
//   type SafePermission,
// } from "@/lib/authentication/permission-system";

// export async function getCurrentUser() {
//   try {
//     const headersList = await headers();
//     const cookieStore = await cookies();
//     const cookieString = cookieStore
//       .getAll()
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     const session = await auth.api.getSession({
//       headers: new Headers({
//         cookie: cookieString,
//         ...Object.fromEntries(headersList.entries()),
//       }),
//     });

//     return session?.user || null;
//   } catch (error) {
//     console.error("❌ Error in getCurrentUser:", error);
//     return null;
//   }
// }

// export async function getUserPermissions(
//   userId: string,
// ): Promise<SafePermission[]> {
//   try {
//     if (!userId) {
//       console.warn("getUserPermissions called with empty userId");
//       return [];
//     }
//     return await authorizationService.getUserPermissions(userId);
//   } catch (error) {
//     console.error("❌ Error getting user permissions:", error);
//     return [];
//   }
// }

// // lib/actions/auth-actions.ts
// "use server";

// import { cookies, headers } from "next/headers";
// import { auth } from "@/lib/authentication/auth-server";
// import { authorizationService } from "@/lib/authentication/permission-system";

// export async function getCurrentUser() {
//   try {
//     console.log("🔍 getCurrentUser called");

//     const headersList = await headers();
//     const cookieStore = await cookies();

//     const cookieString = cookieStore
//       .getAll()
//       .map((cookie) => `${cookie.name}=${cookie.value}`)
//       .join("; ");

//     console.log("📋 Cookies found:", cookieStore.getAll().length);

//     const session = await auth.api.getSession({
//       headers: new Headers({
//         cookie: cookieString,
//         ...Object.fromEntries(headersList.entries()),
//       }),
//     });

//     console.log("🎯 Session result:", {
//       hasSession: !!session,
//       hasUser: !!session?.user,
//       user: session?.user
//         ? {
//             id: session.user.id,
//             email: session.user.email,
//             name: session.user.name,
//           }
//         : null,
//     });

//     return session?.user || null;
//   } catch (error) {
//     console.error("❌ Error in getCurrentUser:", error);
//     return null;
//   }
// }

// export async function getUserPermissions(userId: string) {
//   try {
//     if (!userId) {
//       console.warn("getUserPermissions called with empty userId");
//       return [];
//     }

//     console.log("🔍 getUserPermissions called for user:", userId);
//     const permissions = await authorizationService.getUserPermissions(userId);
//     console.log("📋 Permissions found:", permissions.length);
//     return permissions;
//   } catch (error) {
//     console.error("❌ Error getting user permissions:", error);
//     return [];
//   }
// }
