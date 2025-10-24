import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// config({ path: ".env.local" });

// التحقق من وجود متغيرات البيئة
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
} else {
  console.log("✅ DATABASE_URL environment variable is set");
}

const connectionString = process.env.DATABASE_URL;

// إنشاء اتصال قاعدة البيانات
const client = postgres(connectionString, {
  max: 10, // أقصى عدد للاتصالات
  idle_timeout: 30, // وقت الانتظار قبل إغلاق الاتصال
  connect_timeout: 30, // وقت انتظار الاتصال
});

export const database = drizzle(client, { schema });

// دالة للتحقق من الاتصال
export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
}

// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema";

// const connectionString = process.env.DATABASE_URL || "";
// const client = postgres(connectionString);
// export const database = drizzle(client, { schema });
