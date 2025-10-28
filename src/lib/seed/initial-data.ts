import { database as db } from "@/lib/database";
import { permission, role, rolePermissions } from "@/lib/database/schema";

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
    // صلاحيات النظام الأساسية
    {
      name: "system.access",
      description: "Access the system",
      resource: "system",
      action: "access",
    },
    {
      name: "admin.dashboard.view",
      description: "View admin dashboard",
      resource: "admin",
      action: "read",
    },
    {
      name: "admin.dashboard.edit",
      description: "Edit admin dashboard",
      resource: "admin",
      action: "update",
    },
    {
      name: "admin.settings.view",
      description: "View admin settings",
      resource: "admin",
      action: "read",
    },
    {
      name: "admin.settings.edit",
      description: "Edit admin settings",
      resource: "admin",
      action: "update",
    },

    // صلاحيات إدارة الصلاحيات
    {
      name: "permission.view",
      description: "View permissions list",
      resource: "permission",
      action: "read",
    },
    {
      name: "permission.create",
      description: "Create new permissions",
      resource: "permission",
      action: "create",
    },
    {
      name: "permission.edit",
      description: "Edit permissions",
      resource: "permission",
      action: "update",
    },
    {
      name: "permission.delete",
      description: "Delete permissions",
      resource: "permission",
      action: "delete",
    },
    // صلاحيات إدارة المستخدمين
    {
      name: "user.view",
      description: "View users list",
      resource: "user",
      action: "read",
    },
    {
      name: "user.create",
      description: "Create new users",
      resource: "user",
      action: "create",
    },
    {
      name: "user.edit",
      description: "Edit users",
      resource: "user",
      action: "update",
    },
    {
      name: "user.delete",
      description: "Delete users",
      resource: "user",
      action: "delete",
    },
    // صلاحيات إدارة الأدوار
    {
      name: "role.view",
      description: "View roles list",
      resource: "role",
      action: "read",
    },
    {
      name: "role.create",
      description: "Create new roles",
      resource: "role",
      action: "create",
    },
    {
      name: "role.edit",
      description: "Edit roles",
      resource: "role",
      action: "update",
    },
    {
      name: "role.delete",
      description: "Delete roles",
      resource: "role",
      action: "delete",
    },
    // صلاحيات المحتوى
    {
      name: "post.view",
      description: "View posts",
      resource: "post",
      action: "read",
    },
    {
      name: "post.create",
      description: "Create posts",
      resource: "post",
      action: "create",
    },
    {
      name: "post.edit",
      description: "Edit posts",
      resource: "post",
      action: "update",
    },
    {
      name: "post.delete",
      description: "Delete posts",
      resource: "post",
      action: "delete",
    },
  ];

  private roles: SeedRole[] = [
    {
      name: "super_admin",
      description: "Super Administrator with full system access",
      isDefault: false,
      permissions: [
        "system.access",
        "admin.dashboard.view",
        "admin.dashboard.edit",
        "admin.settings.view",
        "admin.settings.edit",

        "user.view",
        "user.create",
        "user.edit",
        "user.delete",

        "role.view",
        "role.create",
        "role.edit",
        "role.delete",

        "permission.view",
        "permission.create",
        "permission.edit",
        "permission.delete",

        "post.view",
        "post.create",
        "post.edit",
        "post.delete",
      ],
    },
    {
      name: "admin",
      description: "Administrator with extensive access",
      isDefault: false,
      permissions: [
        "system.access",
        "admin.dashboard.view",
        "user.view",
        "role.view",
        "post.view",
      ],
    },
    {
      name: "user",
      description: "Regular user",
      isDefault: true,
      permissions: ["system.access"],
    },
  ];

  async seed(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🚀 Starting database seeding...");

      // التحقق من الاتصال أولاً
      try {
        await db.select().from(role).limit(1);
      } catch (error) {
        console.error("❌ Database connection failed:", error);
        return {
          success: false,
          message:
            "Database connection failed. Please check your DATABASE_URL and ensure the database exists.",
        };
      }

      // التحقق مما إذا كانت البيانات موجودة مسبقاً
      const existingRoles = await db.select().from(role).limit(1);
      if (existingRoles.length > 0) {
        console.log("ℹ️ Database already seeded, skipping...");
        return {
          success: true,
          message: "Database already seeded. No action needed.",
        };
      }

      // 1. إنشاء الصلاحيات
      console.log("📝 Creating permissions...");
      const createdPermissions = await db
        .insert(permission)
        .values(this.permissions)
        .returning();

      console.log(`✅ Created ${createdPermissions.length} permissions`);

      // خريطة للصلاحيات
      const permissionMap = new Map(createdPermissions.map((p) => [p.name, p]));

      // 2. إنشاء الأدوار
      console.log("👥 Creating roles...");
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

      console.log(`✅ Created ${createdRoles.length} roles`);

      // خريطة للأدوار
      const roleMap = new Map(createdRoles.map((r) => [r.name, r]));

      // 3. ربط الصلاحيات بالأدوار
      console.log("🔗 Linking permissions to roles...");
      const rolePermissionEntries: (typeof rolePermissions.$inferInsert)[] = [];

      for (const seedRole of this.roles) {
        const role = roleMap.get(seedRole.name);
        if (!role) {
          console.warn(`⚠️ Role ${seedRole.name} not found, skipping...`);
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
              `⚠️ Permission ${permissionName} not found for role ${seedRole.name}`,
            );
          }
        }
      }

      if (rolePermissionEntries.length > 0) {
        await db.insert(rolePermissions).values(rolePermissionEntries);
        console.log(
          `✅ Created ${rolePermissionEntries.length} role-permission relationships`,
        );
      }

      console.log("🎉 Database seeding completed successfully!");

      return {
        success: true,
        message: `Successfully seeded ${createdPermissions.length} permissions, ${createdRoles.length} roles, and ${rolePermissionEntries.length} relationships.`,
      };
    } catch (error) {
      console.error("❌ Database seeding failed:", error);

      let errorMessage = "Unknown error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: `Seeding failed: ${errorMessage}`,
      };
    }
  }

  async clear(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("🧹 Clearing existing data...");

      // حذف البيانات بالترتيب الصحيح
      await db.delete(rolePermissions);
      await db.delete(permission);
      await db.delete(role);

      console.log("✅ Data cleared successfully!");
      return { success: true, message: "All permission data cleared." };
    } catch (error) {
      console.error("❌ Failed to clear data:", error);
      return {
        success: false,
        message: `Failed to clear data: ${error instanceof Error ? error.message : "Unknown error"}`,
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
