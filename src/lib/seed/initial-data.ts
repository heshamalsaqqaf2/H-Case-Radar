// src/lib/database/seeder.ts

import { AUDIT_LOG_ACTIONS } from "@/lib/authorization/constants/audit-log-actions";
import { permission, role, rolePermissions } from "@/lib/database/schema";
import { database as db } from "@/lib/database/server";

export interface SeedPermission {
  name: string;
  description: string;
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface SeedRole {
  name: string;
  description: string;
  isDefault?: boolean;
  permissions: string[];
}

export class DatabaseSeeder {
  private permissions: SeedPermission[] = [
    // ─────────────────────────────────────────────────────────────────
    // صلاحيات النظام الأساسية والوصول
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.SYSTEM.ACCESS,
      description: "الوصول إلى النظام",
      resource: "system",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.SYSTEM.VIEW,
      description: "عرض إعدادات النظام",
      resource: "system",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.SYSTEM.MANAGE,
      description: "إدارة النظام",
      resource: "system",
      action: "manage",
    },
    {
      name: AUDIT_LOG_ACTIONS.SYSTEM.CONFIGURE,
      description: "تكوين النظام",
      resource: "system",
      action: "configure",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات لوحة التحكم والإدارة
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
      description: "الوصول إلى لوحة الإدارة",
      resource: "admin",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.ADMIN.VIEW,
      description: "عرض لوحة الإدارة",
      resource: "admin",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.ADMIN.CONFIGURE,
      description: "تكوين إعدادات الإدارة",
      resource: "admin",
      action: "configure",
    },
    {
      name: AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
      description: "الوصول إلى لوحة التحكم",
      resource: "dashboard",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,
      description: "عرض لوحة التحكم",
      resource: "dashboard",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.DASHBOARD.CONFIGURE,
      description: "تكوين لوحة التحكم",
      resource: "dashboard",
      action: "configure",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات إدارة المستخدمين
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.USER.ACCESS,
      description: "الوصول إلى قسم المستخدمين",
      resource: "user",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.VIEW,
      description: "عرض قائمة المستخدمين",
      resource: "user",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.CREATE,
      description: "إنشاء مستخدمين جدد",
      resource: "user",
      action: "create",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.UPDATE,
      description: "تعديل بيانات المستخدمين",
      resource: "user",
      action: "update",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.DELETE,
      description: "حذف المستخدمين",
      resource: "user",
      action: "delete",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.ASSIGN_ROLE,
      description: "تعيين أدوار للمستخدمين",
      resource: "user",
      action: "assign_role",
    },
    {
      name: AUDIT_LOG_ACTIONS.USER.REMOVE_ROLE,
      description: "إزالة أدوار من المستخدمين",
      resource: "user",
      action: "remove_role",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات إدارة الأدوار
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.ROLE.ACCESS,
      description: "الوصول إلى قسم الأدوار",
      resource: "role",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.VIEW,
      description: "عرض قائمة الأدوار",
      resource: "role",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.CREATE,
      description: "إنشاء أدوار جديدة",
      resource: "role",
      action: "create",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.UPDATE,
      description: "تعديل الأدوار",
      resource: "role",
      action: "update",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.DELETE,
      description: "حذف الأدوار",
      resource: "role",
      action: "delete",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.ASSIGN_PERMISSIONS,
      description: "تعيين صلاحيات للأدوار",
      resource: "role",
      action: "assign_permissions",
    },
    {
      name: AUDIT_LOG_ACTIONS.ROLE.ASSIGN_USERS,
      description: "تعيين مستخدمين للأدوار",
      resource: "role",
      action: "assign_users",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات إدارة الصلاحيات
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.ACCESS,
      description: "الوصول إلى قسم الصلاحيات",
      resource: "permission",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.VIEW,
      description: "عرض قائمة الصلاحيات",
      resource: "permission",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.CREATE,
      description: "إنشاء صلاحيات جديدة",
      resource: "permission",
      action: "create",
    },
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.UPDATE,
      description: "تعديل الصلاحيات",
      resource: "permission",
      action: "update",
    },
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.DELETE,
      description: "حذف الصلاحيات",
      resource: "permission",
      action: "delete",
    },
    {
      name: AUDIT_LOG_ACTIONS.PERMISSION.ASSIGN_ROLES,
      description: "تعيين أدوار للصلاحيات",
      resource: "permission",
      action: "assign_roles",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات السجلات الأمنية والتدقيق
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.AUDIT_LOG.ACCESS,
      description: "الوصول إلى سجلات التدقيق",
      resource: "audit",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.AUDIT_LOG.VIEW,
      description: "عرض سجلات التدقيق",
      resource: "audit",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.AUDIT_LOG.EXPORT,
      description: "تصدير سجلات التدقيق",
      resource: "audit",
      action: "export",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات الإحصائيات والتقارير
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.STATISTICS.ACCESS,
      description: "الوصول إلى الإحصائيات",
      resource: "statistics",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.STATISTICS.VIEW,
      description: "عرض الإحصائيات",
      resource: "statistics",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.STATISTICS.SEARCH,
      description: "البحث في الإحصائيات",
      resource: "statistics",
      action: "search",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات إعدادات النظام
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.SETTINGS.ACCESS,
      description: "الوصول إلى الإعدادات",
      resource: "settings",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.SETTINGS.VIEW,
      description: "عرض الإعدادات",
      resource: "settings",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.SETTINGS.UPDATE,
      description: "تعديل الإعدادات",
      resource: "settings",
      action: "update",
    },

    // ─────────────────────────────────────────────────────────────────
    // صلاحيات قاعدة البيانات والتهيئة
    // ─────────────────────────────────────────────────────────────────
    {
      name: AUDIT_LOG_ACTIONS.DATABASE_SEEDER.ACCESS,
      description: "الوصول إلى أداة التهيئة",
      resource: "seeder",
      action: "access",
    },
    {
      name: AUDIT_LOG_ACTIONS.DATABASE_SEEDER.VIEW,
      description: "عرض حالة التهيئة",
      resource: "seeder",
      action: "view",
    },
    {
      name: AUDIT_LOG_ACTIONS.DATABASE_SEEDER.RUN,
      description: "تشغيل عملية التهيئة",
      resource: "seeder",
      action: "run",
    },
    {
      name: AUDIT_LOG_ACTIONS.DATABASE_SEEDER.REVERT,
      description: "تراجع عن التهيئة",
      resource: "seeder",
      action: "revert",
    },
  ];

  private roles: SeedRole[] = [
    {
      name: "super_admin",
      description: "مدير النظام العام - يمتلك جميع الصلاحيات",
      isDefault: false,
      permissions: [
        // النظام والإدارة
        AUDIT_LOG_ACTIONS.SYSTEM.ACCESS,
        AUDIT_LOG_ACTIONS.SYSTEM.VIEW,
        AUDIT_LOG_ACTIONS.SYSTEM.MANAGE,
        AUDIT_LOG_ACTIONS.SYSTEM.CONFIGURE,
        AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
        AUDIT_LOG_ACTIONS.ADMIN.VIEW,
        AUDIT_LOG_ACTIONS.ADMIN.CONFIGURE,
        AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
        AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,
        AUDIT_LOG_ACTIONS.DASHBOARD.CONFIGURE,

        // إدارة المستخدمين
        AUDIT_LOG_ACTIONS.USER.ACCESS,
        AUDIT_LOG_ACTIONS.USER.VIEW,
        AUDIT_LOG_ACTIONS.USER.CREATE,
        AUDIT_LOG_ACTIONS.USER.UPDATE,
        AUDIT_LOG_ACTIONS.USER.DELETE,
        AUDIT_LOG_ACTIONS.USER.ASSIGN_ROLE,
        AUDIT_LOG_ACTIONS.USER.REMOVE_ROLE,

        // إدارة الأدوار
        AUDIT_LOG_ACTIONS.ROLE.ACCESS,
        AUDIT_LOG_ACTIONS.ROLE.VIEW,
        AUDIT_LOG_ACTIONS.ROLE.CREATE,
        AUDIT_LOG_ACTIONS.ROLE.UPDATE,
        AUDIT_LOG_ACTIONS.ROLE.DELETE,
        AUDIT_LOG_ACTIONS.ROLE.ASSIGN_PERMISSIONS,
        AUDIT_LOG_ACTIONS.ROLE.ASSIGN_USERS,

        // إدارة الصلاحيات
        AUDIT_LOG_ACTIONS.PERMISSION.ACCESS,
        AUDIT_LOG_ACTIONS.PERMISSION.VIEW,
        AUDIT_LOG_ACTIONS.PERMISSION.CREATE,
        AUDIT_LOG_ACTIONS.PERMISSION.UPDATE,
        AUDIT_LOG_ACTIONS.PERMISSION.DELETE,
        AUDIT_LOG_ACTIONS.PERMISSION.ASSIGN_ROLES,

        // السجلات والإحصائيات
        AUDIT_LOG_ACTIONS.AUDIT_LOG.ACCESS,
        AUDIT_LOG_ACTIONS.AUDIT_LOG.VIEW,
        AUDIT_LOG_ACTIONS.AUDIT_LOG.EXPORT,
        AUDIT_LOG_ACTIONS.STATISTICS.ACCESS,
        AUDIT_LOG_ACTIONS.STATISTICS.VIEW,
        AUDIT_LOG_ACTIONS.STATISTICS.SEARCH,

        // الإعدادات
        AUDIT_LOG_ACTIONS.SETTINGS.ACCESS,
        AUDIT_LOG_ACTIONS.SETTINGS.VIEW,
        AUDIT_LOG_ACTIONS.SETTINGS.UPDATE,

        // إدارة قاعدة البيانات
        AUDIT_LOG_ACTIONS.DATABASE_SEEDER.ACCESS,
        AUDIT_LOG_ACTIONS.DATABASE_SEEDER.VIEW,
        AUDIT_LOG_ACTIONS.DATABASE_SEEDER.RUN,
        AUDIT_LOG_ACTIONS.DATABASE_SEEDER.REVERT,
      ],
    },
    {
      name: "admin",
      description: "مدير النظام - يمتلك صلاحيات إدارية واسعة",
      isDefault: false,
      permissions: [
        // النظام والإدارة
        AUDIT_LOG_ACTIONS.SYSTEM.ACCESS,
        AUDIT_LOG_ACTIONS.ADMIN.ACCESS,
        AUDIT_LOG_ACTIONS.ADMIN.VIEW,
        AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
        AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,

        // إدارة المستخدمين
        AUDIT_LOG_ACTIONS.USER.ACCESS,
        AUDIT_LOG_ACTIONS.USER.VIEW,
        AUDIT_LOG_ACTIONS.USER.CREATE,
        AUDIT_LOG_ACTIONS.USER.UPDATE,

        // إدارة الأدوار
        AUDIT_LOG_ACTIONS.ROLE.ACCESS,
        AUDIT_LOG_ACTIONS.ROLE.VIEW,

        // إدارة الصلاحيات
        AUDIT_LOG_ACTIONS.PERMISSION.ACCESS,
        AUDIT_LOG_ACTIONS.PERMISSION.VIEW,

        // السجلات والإحصائيات
        AUDIT_LOG_ACTIONS.AUDIT_LOG.ACCESS,
        AUDIT_LOG_ACTIONS.AUDIT_LOG.VIEW,
        AUDIT_LOG_ACTIONS.STATISTICS.ACCESS,
        AUDIT_LOG_ACTIONS.STATISTICS.VIEW,

        // الإعدادات
        AUDIT_LOG_ACTIONS.SETTINGS.ACCESS,
        AUDIT_LOG_ACTIONS.SETTINGS.VIEW,
      ],
    },
    {
      name: "user",
      description: "مستخدم عادي - صلاحيات أساسية",
      isDefault: true,
      permissions: [
        AUDIT_LOG_ACTIONS.SYSTEM.ACCESS,
        AUDIT_LOG_ACTIONS.DASHBOARD.ACCESS,
        AUDIT_LOG_ACTIONS.DASHBOARD.VIEW,
      ],
    },
  ];

  async seed(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🚀 بدء عملية تهيئة قاعدة البيانات...");

      // التحقق من الاتصال أولاً
      try {
        await db.select().from(role).limit(1);
      } catch (error) {
        console.error("❌ فشل الاتصال بقاعدة البيانات:", error);
        return {
          success: false,
          message:
            "فشل الاتصال بقاعدة البيانات. يرجى التحقق من إعدادات الاتصال.",
        };
      }

      // التحقق مما إذا كانت البيانات موجودة مسبقاً
      const existingRoles = await db.select().from(role).limit(1);
      if (existingRoles.length > 0) {
        console.log("ℹ️ قاعدة البيانات مهيئة مسبقاً، تخطي العملية...");
        return {
          success: true,
          message: "قاعدة البيانات مهيئة مسبقاً. لا حاجة لإجراء أي عمل.",
        };
      }

      // 1. إنشاء الصلاحيات
      console.log("📝 إنشاء الصلاحيات...");
      const createdPermissions = await db
        .insert(permission)
        .values(this.permissions)
        .returning();

      console.log(`✅ تم إنشاء ${createdPermissions.length} صلاحية`);

      // خريطة للصلاحيات
      const permissionMap = new Map(createdPermissions.map((p) => [p.name, p]));

      // 2. إنشاء الأدوار
      console.log("👥 إنشاء الأدوار...");
      const createdRoles = await db
        .insert(role)
        .values(
          this.roles.map((role) => ({
            name: role.name,
            description: role.description,
            isDefault: role.isDefault || false,
          })),
        )
        .returning();

      console.log(`✅ تم إنشاء ${createdRoles.length} دور`);

      // خريطة للأدوار
      const roleMap = new Map(createdRoles.map((r) => [r.name, r]));

      // 3. ربط الصلاحيات بالأدوار
      console.log("🔗 ربط الصلاحيات بالأدوار...");
      const rolePermissionEntries: (typeof rolePermissions.$inferInsert)[] = [];

      for (const seedRole of this.roles) {
        const role = roleMap.get(seedRole.name);
        if (!role) {
          console.warn(`⚠️ الدور ${seedRole.name} غير موجود، تخطي...`);
          continue;
        }

        for (const permissionName of seedRole.permissions) {
          const permission = permissionMap.get(permissionName);
          if (permission) {
            rolePermissionEntries.push({
              roleId: role.id,
              permissionId: permission.id,
            });
          } else {
            console.warn(
              `⚠️ الصلاحية ${permissionName} غير موجودة للدور ${seedRole.name}`,
            );
          }
        }
      }

      if (rolePermissionEntries.length > 0) {
        await db.insert(rolePermissions).values(rolePermissionEntries);
        console.log(
          `✅ تم إنشاء ${rolePermissionEntries.length} علاقة بين الأدوار والصلاحيات`,
        );
      }

      console.log("🎉 اكتملت عملية تهيئة قاعدة البيانات بنجاح!");

      return {
        success: true,
        message: `تمت التهيئة بنجاح: ${createdPermissions.length} صلاحية، ${createdRoles.length} دور، ${rolePermissionEntries.length} علاقة.`,
      };
    } catch (error) {
      console.error("❌ فشلت عملية تهيئة قاعدة البيانات:", error);

      let errorMessage = "حدث خطأ غير معروف";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: `فشلت التهيئة: ${errorMessage}`,
      };
    }
  }

  async clear(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🧹 حذف البيانات الموجودة...");

      // حذف البيانات بالترتيب الصحيح
      await db.delete(rolePermissions);
      await db.delete(permission);
      await db.delete(role);

      console.log("✅ تم حذف البيانات بنجاح!");
      return { success: true, message: "تم حذف جميع بيانات الصلاحيات." };
    } catch (error) {
      console.error("❌ فشل حذف البيانات:", error);
      return {
        success: false,
        message: `فشل حذف البيانات: ${error instanceof Error ? error.message : "خطأ غير معروف"}`,
      };
    }
  }

  async reseed(): Promise<{ success: boolean; message: string }> {
    const clearResult = await this.clear();
    if (!clearResult.success) {
      return clearResult;
    }
    return await this.seed();
  }
}

export const databaseSeeder = new DatabaseSeeder();

// import { database as db } from "@/lib/database";
// import { permission, role, rolePermissions } from "@/lib/database/schema";

// export interface SeedPermission {
//   name: string;
//   description: string;
//   resource: string;
//   action: string;
//   conditions?: Record<string, unknown>;
// }

// export interface SeedRole {
//   name: string;
//   description: string;
//   isDefault?: boolean;
//   permissions: string[];
// }

// export class DatabaseSeeder {
//   private permissions: SeedPermission[] = [
//     // صلاحيات النظام الأساسية
//     {
//       name: "system.access",
//       description: "Access the system",
//       resource: "system",
//       action: "access",
//     },
//     {
//       name: "admin.dashboard.view",
//       description: "View admin dashboard",
//       resource: "admin",
//       action: "read",
//     },
//     {
//       name: "admin.dashboard.edit",
//       description: "Edit admin dashboard",
//       resource: "admin",
//       action: "update",
//     },
//     {
//       name: "admin.settings.view",
//       description: "View admin settings",
//       resource: "admin",
//       action: "read",
//     },
//     {
//       name: "admin.settings.edit",
//       description: "Edit admin settings",
//       resource: "admin",
//       action: "update",
//     },

//     // صلاحيات إدارة الصلاحيات
//     {
//       name: "permission.view",
//       description: "View permissions list",
//       resource: "permission",
//       action: "read",
//     },
//     {
//       name: "permission.create",
//       description: "Create new permissions",
//       resource: "permission",
//       action: "create",
//     },
//     {
//       name: "permission.edit",
//       description: "Edit permissions",
//       resource: "permission",
//       action: "update",
//     },
//     {
//       name: "permission.delete",
//       description: "Delete permissions",
//       resource: "permission",
//       action: "delete",
//     },
//     // صلاحيات إدارة المستخدمين
//     {
//       name: "user.view",
//       description: "View users list",
//       resource: "user",
//       action: "read",
//     },
//     {
//       name: "user.create",
//       description: "Create new users",
//       resource: "user",
//       action: "create",
//     },
//     {
//       name: "user.edit",
//       description: "Edit users",
//       resource: "user",
//       action: "update",
//     },
//     {
//       name: "user.delete",
//       description: "Delete users",
//       resource: "user",
//       action: "delete",
//     },
//     // صلاحيات إدارة الأدوار
//     {
//       name: "role.view",
//       description: "View roles list",
//       resource: "role",
//       action: "read",
//     },
//     {
//       name: "role.create",
//       description: "Create new roles",
//       resource: "role",
//       action: "create",
//     },
//     {
//       name: "role.edit",
//       description: "Edit roles",
//       resource: "role",
//       action: "update",
//     },
//     {
//       name: "role.delete",
//       description: "Delete roles",
//       resource: "role",
//       action: "delete",
//     },
//     // صلاحيات المحتوى
//     {
//       name: "post.view",
//       description: "View posts",
//       resource: "post",
//       action: "read",
//     },
//     {
//       name: "post.create",
//       description: "Create posts",
//       resource: "post",
//       action: "create",
//     },
//     {
//       name: "post.edit",
//       description: "Edit posts",
//       resource: "post",
//       action: "update",
//     },
//     {
//       name: "post.delete",
//       description: "Delete posts",
//       resource: "post",
//       action: "delete",
//     },
//   ];

//   private roles: SeedRole[] = [
//     {
//       name: "super_admin",
//       description: "Super Administrator with full system access",
//       isDefault: false,
//       permissions: [
//         "system.access",
//         "admin.dashboard.view",
//         "admin.dashboard.edit",
//         "admin.settings.view",
//         "admin.settings.edit",

//         "user.view",
//         "user.create",
//         "user.edit",
//         "user.delete",

//         "role.view",
//         "role.create",
//         "role.edit",
//         "role.delete",

//         "permission.view",
//         "permission.create",
//         "permission.edit",
//         "permission.delete",

//         "post.view",
//         "post.create",
//         "post.edit",
//         "post.delete",
//       ],
//     },
//     {
//       name: "admin",
//       description: "Administrator with extensive access",
//       isDefault: false,
//       permissions: [
//         "system.access",
//         "admin.dashboard.view",
//         "user.view",
//         "role.view",
//         "post.view",
//       ],
//     },
//     {
//       name: "user",
//       description: "Regular user",
//       isDefault: true,
//       permissions: ["system.access"],
//     },
//   ];

//   async seed(): Promise<{ success: boolean; message: string }> {
//     try {
//       console.log("🚀 Starting database seeding...");

//       // التحقق من الاتصال أولاً
//       try {
//         await db.select().from(role).limit(1);
//       } catch (error) {
//         console.error("❌ Database connection failed:", error);
//         return {
//           success: false,
//           message:
//             "Database connection failed. Please check your DATABASE_URL and ensure the database exists.",
//         };
//       }

//       // التحقق مما إذا كانت البيانات موجودة مسبقاً
//       const existingRoles = await db.select().from(role).limit(1);
//       if (existingRoles.length > 0) {
//         console.log("ℹ️ Database already seeded, skipping...");
//         return {
//           success: true,
//           message: "Database already seeded. No action needed.",
//         };
//       }

//       // 1. إنشاء الصلاحيات
//       console.log("📝 Creating permissions...");
//       const createdPermissions = await db
//         .insert(permission)
//         .values(this.permissions)
//         .returning();

//       console.log(`✅ Created ${createdPermissions.length} permissions`);

//       // خريطة للصلاحيات
//       const permissionMap = new Map(createdPermissions.map((p) => [p.name, p]));

//       // 2. إنشاء الأدوار
//       console.log("👥 Creating roles...");
//       const createdRoles = await db
//         .insert(role)
//         .values(
//           this.roles.map((role) => ({
//             name: role.name,
//             description: role.description,
//             isDefault: role.isDefault || false,
//           })),
//         )
//         .returning();

//       console.log(`✅ Created ${createdRoles.length} roles`);

//       // خريطة للأدوار
//       const roleMap = new Map(createdRoles.map((r) => [r.name, r]));

//       // 3. ربط الصلاحيات بالأدوار
//       console.log("🔗 Linking permissions to roles...");
//       const rolePermissionEntries: (typeof rolePermissions.$inferInsert)[] = [];

//       for (const seedRole of this.roles) {
//         const role = roleMap.get(seedRole.name);
//         if (!role) {
//           console.warn(`⚠️ Role ${seedRole.name} not found, skipping...`);
//           continue;
//         }

//         for (const permissionName of seedRole.permissions) {
//           const permission = permissionMap.get(permissionName);
//           if (permission) {
//             rolePermissionEntries.push({
//               roleId: role.id,
//               permissionId: permission.id,
//             });
//           } else {
//             console.warn(
//               `⚠️ Permission ${permissionName} not found for role ${seedRole.name}`,
//             );
//           }
//         }
//       }

//       if (rolePermissionEntries.length > 0) {
//         await db.insert(rolePermissions).values(rolePermissionEntries);
//         console.log(
//           `✅ Created ${rolePermissionEntries.length} role-permission relationships`,
//         );
//       }

//       console.log("🎉 Database seeding completed successfully!");

//       return {
//         success: true,
//         message: `Successfully seeded ${createdPermissions.length} permissions, ${createdRoles.length} roles, and ${rolePermissionEntries.length} relationships.`,
//       };
//     } catch (error) {
//       console.error("❌ Database seeding failed:", error);

//       let errorMessage = "Unknown error occurred";
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       return {
//         success: false,
//         message: `Seeding failed: ${errorMessage}`,
//       };
//     }
//   }

//   async clear(): Promise<{ success: boolean; message: string }> {
//     try {
//       console.log("🧹 Clearing existing data...");

//       // حذف البيانات بالترتيب الصحيح
//       await db.delete(rolePermissions);
//       await db.delete(permission);
//       await db.delete(role);

//       console.log("✅ Data cleared successfully!");
//       return { success: true, message: "All permission data cleared." };
//     } catch (error) {
//       console.error("❌ Failed to clear data:", error);
//       return {
//         success: false,
//         message: `Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`,
//       };
//     }
//   }

//   async reseed(): Promise<{ success: boolean; message: string }> {
//     const clearResult = await this.clear();
//     if (!clearResult.success) {
//       return clearResult;
//     }
//     return await this.seed();
//   }
// }

// export const databaseSeeder = new DatabaseSeeder();
