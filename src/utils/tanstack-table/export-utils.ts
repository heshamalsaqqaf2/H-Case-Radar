import type { Permission } from "@/types/tanstack-table-types/permission";

export type ExportFormat = "csv" | "json" | "excel";

export const exportToCSV = (
  data: Permission[],
  filename: string = "permissions",
) => {
  const headers = [
    "Name",
    "Description",
    "Resource",
    "Action",
    "Type",
    "Created At",
  ];

  const csvContent = [
    headers.join(","),
    ...data.map((permission) =>
      [
        `"${permission.name.replace(/"/g, '""')}"`,
        `"${(permission.description || "").replace(/"/g, '""')}"`,
        `"${permission.resource.replace(/"/g, '""')}"`,
        `"${permission.action}"`,
        `"${permission.conditions ? "Dynamic" : "Static"}"`,
        `"${new Date(permission.createdAt).toLocaleDateString()}"`,
      ].join(","),
    ),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
};

export const exportToJSON = (
  data: Permission[],
  filename: string = "permissions",
) => {
  const jsonContent = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      count: data.length,
      data: data,
    },
    null,
    2,
  );

  downloadFile(jsonContent, `${filename}.json`, "application/json");
};

export const exportToExcel = async (
  data: Permission[],
  filename: string = "permissions",
) => {
  // محاكاة لتصدير Excel - يمكن استخدام مكتبة مثل xlsx في الإصدار الحقيقي
  const excelContent = exportToCSV(data, filename);
  // في التطبيق الحقيقي، نستخدم مكتبة like sheetjs
  console.log("Excel export would be implemented with a library like sheetjs");
  return excelContent;
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
