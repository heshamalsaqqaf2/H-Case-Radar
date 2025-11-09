"use server";

import { revalidatePath } from "next/cache";
import { databaseSeeder } from "@/lib/seed/initial-data";

export async function seedDatabase() {
  try {
    const result = await databaseSeeder.seed();
    if (result.success) {
      revalidatePath("/admin/roles");
      revalidatePath("/admin/permissions");
    }
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Seeding Failed: ${error instanceof Error ? error.message : "Unknown Error"}`,
    };
  }
}

export async function clearDatabase() {
  try {
    const result = await databaseSeeder.clear();
    if (result.success) {
      revalidatePath("/admin/roles");
      revalidatePath("/admin/permissions");
    }
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Clear Failed: ${error instanceof Error ? error.message : "Unknown Error"}`,
    };
  }
}

export async function reseedDatabase() {
  try {
    const result = await databaseSeeder.reseed();
    if (result.success) {
      revalidatePath("/admin/roles");
      revalidatePath("/admin/permissions");
    }
    return result;
  } catch (error) {
    return {
      success: false,
      message: `Reseeding Failed: ${error instanceof Error ? error.message : "Unknown Error"}`,
    };
  }
}
