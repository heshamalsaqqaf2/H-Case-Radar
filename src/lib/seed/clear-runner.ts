import { testConnection } from "@/lib/database";
import { databaseSeeder } from "./initial-data";

async function main() {
  console.log("🚀 Starting manual database Cleaning...");

  // التحقق من الاتصال أولاً
  console.log("🔍 Testing database connection...");
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error("❌ Cannot connect to database. Please check:");
    console.error("   1. DATABASE_URL environment variable");
    console.error("   2. Database server is running");
    console.error("   3. Database exists and user has permissions");
    process.exit(1);
  }

  console.log("✅ Database connection successful");

  const result = await databaseSeeder.clear();

  if (result.success) {
    console.log("✅", result.message);
    process.exit(0);
  } else {
    console.error("❌", result.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("💥 Unexpected error:", error);
  process.exit(1);
});
