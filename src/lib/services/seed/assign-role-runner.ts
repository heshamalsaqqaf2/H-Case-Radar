import { assignSuperAdminToCurrentUser } from "./assign-admin-role";

// استبدل هذا بالإيميل الخاص بك
const YOUR_EMAIL = "admin@h-case-radar.com"; // ⬅️ هذا إيميلك الصحيح

async function main() {
  try {
    if (!YOUR_EMAIL || YOUR_EMAIL !== "admin@h-case-radar.com") {
      // ⬅️ غير الشرط هنا
      console.error("❌ Please set YOUR_EMAIL in assign-role-runner.ts");
      console.log("📝 Open the file and change 'your-email@example.com' to your actual email");
      process.exit(1);
    }

    console.log("🚀 Assigning super_admin role to your account...");

    const result = await assignSuperAdminToCurrentUser(YOUR_EMAIL);

    console.log("🎉", result.message);
    console.log("📍 You can now access the admin dashboard at: http://localhost:3000/admin");
  } catch (error) {
    console.error("❌ Failed to assign role:", error);
    process.exit(1);
  }
}

main();
