import { role } from "@/lib/database/schema";
import { database } from "@/lib/database/server";
import { databaseSeeder } from "./initial-data";

export async function autoSeedIfNeeded() {
  try {
    // التحقق مما إذا كانت هناك أي أدوار موجودة
    const existingRoles = await database.select().from(role).limit(1);

    if (existingRoles.length === 0) {
      console.log("🔍 No roles found. Starting auto-seeding...");
      const result = await databaseSeeder.seed();

      if (result.success) {
        console.log("✅ Auto-seeding completed successfully");
      } else {
        console.error("❌ Auto-seeding failed:", result.message);
      }

      return result;
    }

    console.log("ℹ️ Database already seeded, skipping auto-seed");
    return { success: true, message: "Database already seeded" };
  } catch (error) {
    console.error("❌ Auto-seeding error:", error);
    return {
      success: false,
      message: `Auto-seeding failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
