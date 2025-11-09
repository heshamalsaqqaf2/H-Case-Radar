// src/lib/database/index.ts
// هذا الملف للتصديرات فقط - لا يحتوي على أي اتصال بقاعدة البيانات

// تصدير الـ schema للاستخدام في العميل والخادم
export * from "./schema";

// تصدير الأنواع
export type { Database } from "./server";

// تصدير الدوال المساعدة إذا كانت موجودة
// export * from './utils';

// تصدير الثوابت
// export * from './constants';

// =============================================
// import { config } from "dotenv";
// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema";

// config({ path: ".env.local" });
// if (!process.env.DATABASE_URL) {
//   throw new Error("❌ Error DATABASE_URL Environment Variable Is Not Set.");
// } else {
//   console.log("✅ Success DATABASE_URL Environment Variable Is Set");
// }
// const connectionString = process.env.DATABASE_URL;
// const client = postgres(connectionString, {
//   max: 10, // Max Number Connections.
//   idle_timeout: 30, // Timeout Before Closing Connections.
//   connect_timeout: 30, // Time Waiting Connections.
// });

// export const database = drizzle(client, { schema });
// export async function testConnection() {
//   try {
//     await client`SELECT 1`;
//     console.log("✅ Database Connection Successful.");
//     return true;
//   } catch (error) {
//     console.error("❌ Database Connection Failed: ", error);
//     return false;
//   }
// }
