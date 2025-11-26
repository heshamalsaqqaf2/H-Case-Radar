export function generateSystemEmail(name: string): string {
  // تحويل الاسم إلى صيغة مناسبة للبريد الإلكتروني
  const cleanName = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9.]/g, "")
    .replace(/\.+/g, ".");

  const timestamp = Date.now().toString().slice(-4);
  return `${cleanName}.${timestamp}@h-case-radar.com`;
}
