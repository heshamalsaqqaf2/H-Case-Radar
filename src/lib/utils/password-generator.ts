// src/lib/utils/password-generator.ts
export function generateStrongPassword(length: number = 15): string {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const charset = lowercase + uppercase + numbers + symbols;
  let password = "";

  // تأكد من وجود حرف كبير، رقم، ورمز على الأقل
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // أكمل الباقي
  for (let i = 3; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // خلط الأحرف
  return password
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("");
}
