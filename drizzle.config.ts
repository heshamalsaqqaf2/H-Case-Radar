/** biome-ignore-all lint/style/noNonNullAssertion: <> */
import { config } from "dotenv";
import { type Config, defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("❌ DATABASE_URL Is Not Defined In '.env.local'");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/database/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
  migrations: {
    table: "migrations_meta",
    schema: "public",
  },
} satisfies Config);
