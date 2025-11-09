import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

config({ path: ".env.local" });

// تأكد أن هذا للخادم فقط
if (typeof window !== "undefined") {
  throw new Error("❌ Database should only be used on the server side");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

const client = postgres(connectionString, {
  max: 10, // أقصى عدد اتصالات
  idle_timeout: 30, // وقت الانتظار قبل إغلاق الاتصال
  connect_timeout: 30, // وقت انتظار الاتصال
  prepare: false, // تعطيل التحضير لتحسين الأداء
});

// إنشاء instance من Drizzle
export const database = drizzle(client, { schema });

export async function testConnection() {
  try {
    await client`SELECT 1`;
    console.log("✅ Database Connection Successful.");
    return true;
  } catch (error) {
    console.error("❌ Database Connection Failed: ", error);
    return false;
  }
}

export type Database = typeof database;
