// lib/actions/permission-actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { database as db } from "@/lib/database/index";
import { permission, rolePermissions } from "@/lib/database/schema";
import type { SafePermission } from "@/lib/types/permission";

const createPermissionSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/),
  description: z.string().max(200).optional(),
  resource: z.string().min(1),
  action: z.string().min(1),
  conditions: z.string().optional(), // JSON string
});

const updatePermissionSchema = z.object({
  id: z.string().uuid("معرف الصلاحية غير صالح"),
  name: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9._-]+$/),
  description: z.string().max(200).optional(),
  resource: z.string().min(1),
  action: z.string().min(1),
  conditions: z.string().optional(), // JSON string
});

export async function createPermission(formData: FormData) {
  try {
    const validatedData = createPermissionSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      resource: formData.get("resource"),
      action: formData.get("action"),
      conditions: formData.get("conditions") || undefined,
    });

    // التحقق من عدم تكرار الاسم
    const existingPermission = await db
      .select()
      .from(permission)
      .where(eq(permission.name, validatedData.name))
      .limit(1);

    if (existingPermission.length > 0) {
      return { success: false, message: "إسم الصلاحية موجود بالفعل" };
    }

    // تحويل الـ conditions من نص إلى JSON
    let parsedConditions: Record<string, unknown> | null = null;
    if (validatedData.conditions) {
      parsedConditions = JSON.parse(validatedData.conditions);
    }

    await db.insert(permission).values({
      name: validatedData.name,
      description: validatedData.description || null,
      resource: validatedData.resource,
      action: validatedData.action,
      conditions: parsedConditions,
    });

    revalidatePath("/admin/permissions");

    return { success: true, message: "تم إنشاء الصلاحية بنجاح" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        message:
          "بيانات غير صالحة في الشروط والأحكام, يرجى التحقق من بيانات الشروط JSON",
      };
    }
    console.error("Error creating permission:", error);
    return { success: false, message: "فشل إنشاء الصلاحية" };
  }
}

export async function deletePermission(permissionId: string) {
  try {
    // التحقق مما إذا كانت الصلاحية مرتبطة بدور
    const rolePermissionRelations = await db
      .select()
      .from(permission)
      .innerJoin(
        rolePermissions,
        eq(permission.id, rolePermissions.permissionId),
      )
      .where(eq(permission.id, permissionId))
      .limit(1);

    if (rolePermissionRelations.length > 0) {
      return {
        success: false,
        message:
          "لا يمكن حذف الصلاحية المخصصة الى الأدوار, يجب حذف الأدوار  المرتبطة بهذه الصلاحية اولا",
        // message: "Cannot delete permission that is assigned to roles",
      };
    }

    await db.delete(permission).where(eq(permission.id, permissionId));

    revalidatePath("/admin/permissions");

    return { success: true, message: "تم حذف الصلاحية بنجاح" };
  } catch (error) {
    console.error("حدث خطأ اثناء حذف الصلاحية, يرجى المحاولة مرة اخرى:", error);
    return {
      success: false,
      message: "فشل حذف الصلاحية, يرجى المحاولة مرة اخرى",
    };
  }
}

export async function updatePermission(formData: FormData) {
  try {
    const validatedData = updatePermissionSchema.parse({
      id: formData.get("id"),
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      resource: formData.get("resource"),
      action: formData.get("action"),
      conditions: formData.get("conditions") || undefined,
    });

    // ✅ التحقق من عدم وجود صلاحية أخرى بنفس الاسم (باستثناء هذه الصلاحية نفسها)
    const existingPermission = await db
      .select()
      .from(permission)
      .where(eq(permission.name, validatedData.name))
      .limit(1);

    if (
      existingPermission.length > 0 &&
      existingPermission[0].id !== validatedData.id
    ) {
      return {
        success: false,
        message: "اسم الصلاحية موجود بالفعل, يرجى تغيير الاسم",
      };
    }

    // تحويل الـ conditions من نص إلى JSON
    let parsedConditions: Record<string, unknown> | null = null;
    if (validatedData.conditions) {
      parsedConditions = JSON.parse(validatedData.conditions);
    }

    // تحديث الصلاحية
    await db
      .update(permission)
      .set({
        name: validatedData.name,
        description: validatedData.description || null,
        resource: validatedData.resource,
        action: validatedData.action,
        conditions: parsedConditions,
        updatedAt: new Date(),
      })
      .where(eq(permission.id, validatedData.id));

    revalidatePath("/admin/permissions");
    return { success: true, message: "تم تحديث الصلاحية بنجاح" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: error.issues[0].message };
    }
    if (error instanceof SyntaxError) {
      return {
        success: false,
        message:
          "بيانات غير صالحة في الشروط والأحكام, يرجى التحقق من بيانات الشروط JSON",
      };
    }
    console.error("خطأ في تحديث الصلاحية:", error);
    return {
      success: false,
      message: "فشل تحديث الصلاحية, يرجى المحاولة مرة اخرى",
    };
  }
}

export async function getPermissionById(
  permissionId: string,
): Promise<SafePermission | null> {
  try {
    const result = await db
      .select()
      .from(permission)
      .where(eq(permission.id, permissionId))
      .limit(1);

    if (result.length === 0) return null;

    const raw = result[0];

    // تحويل الـ conditions من unknown إلى Record<string, unknown> | null
    const conditions =
      typeof raw.conditions === "object" &&
      raw.conditions !== null &&
      !Array.isArray(raw.conditions)
        ? (raw.conditions as Record<string, unknown>)
        : null;

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      resource: raw.resource,
      action: raw.action,
      conditions,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  } catch (error) {
    console.error("خطأ في الحصول على الصلاحية:", error);
    return null;
  }
}

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

//     // التحقق من عدم تكرار الاسم (إذا تم تغييره)
//     const existingPermission = await db
//       .select()
//       .from(permission)
//       .where(
//         and(
//           eq(permission.name, validatedData.name),
//           eq(permission.id, validatedData.id), // لا تشمل نفس الصلاحية
//         ),
//       )
//       .limit(1);

//     if (existingPermission.length > 0) {
//       return { success: false, message: "Permission name already exists" };
//     }

//     // تحويل الـ conditions من نص إلى JSON
//     let parsedConditions: Record<string, unknown> | null = null;
//     if (validatedData.conditions) {
//       parsedConditions = JSON.parse(validatedData.conditions);
//     }

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

//     return { success: true, message: "Permission updated successfully" };
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return { success: false, message: error.issues[0].message };
//     }
//     if (error instanceof SyntaxError) {
//       return { success: false, message: "Invalid JSON in conditions" };
//     }
//     console.error("Error updating permission:", error);
//     return { success: false, message: "Failed to update permission" };
//   }
// }
