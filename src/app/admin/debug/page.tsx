// src/app/admin/debug/page.tsx
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { debugUserPermissions } from "./permissions-debug";

export default async function DebugPage() {
  const debugInfo = await debugUserPermissions();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">تشخيص الصلاحيات</h1>

      {debugInfo.error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>خطأ:</strong> {debugInfo.error}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>معرف المستخدم:</strong> {debugInfo.userId}
          </div>

          <div className="grid gap-4">
            {debugInfo.results?.map((result: any, index: number) => (
              <div
                key={index}
                className={`p-4 border rounded ${
                  result.allowed
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <strong>{result.permission}</strong>
                    <div className="text-sm text-gray-600">
                      Resource: {result.resource} | Action: {result.action}
                    </div>
                  </div>
                  <span
                    className={
                      result.allowed ? "text-green-600" : "text-red-600"
                    }
                  >
                    {result.allowed ? "✅ مسموح" : "❌ مرفوض"}
                  </span>
                </div>
                {!result.allowed && (
                  <div className="mt-2 text-sm text-red-600">
                    {result.reason}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-bold mb-2">ملخص:</h3>
            <p>الإجمالي: {debugInfo.summary?.total}</p>
            <p className="text-green-600">
              مسموح: {debugInfo.summary?.allowed}
            </p>
            <p className="text-red-600">مرفوض: {debugInfo.summary?.denied}</p>
          </div>
        </div>
      )}
    </div>
  );
}
