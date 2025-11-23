// app/admin/complaints/[id]/page.tsx

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getComplaintByIdAction } from "@/lib/complaints/actions/complaints-actions";
import { ComplaintDetail } from "../components/complaint-detail";

interface ComplaintPageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintPage({ params }: ComplaintPageProps) {
  const { id } = await params;
  const complaintResult = await getComplaintByIdAction({ complaintId: id });
  if (!complaintResult.success || !complaintResult.data) {
    return (
      <main className="container py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">البلاغ غير موجود, يرجى المحاولة مرة أخرى والتأكد من معرف البلاغ.</h1>
          <Link href="/admin/complaints" className="btn btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى البلاغ
          </Link>
        </div>
      </main>
    );
  }
  return (
    <div className="container py-6">
      <ComplaintDetail complaintId={id} />
    </div>
  );
}

// export async function generateMetadata({ params }: ComplaintPageProps): Promise<Metadata> {
//   const { id } = await params;
//   const complaintResult = await getComplaintByIdAction({ complaintId: id });
//   if (!complaintResult.success || !complaintResult.data) {
//     return { title: "البلاغ غير موجود, يرجى المحاولة مرة أخرى والتأكد من معرف البلاغ." };
//   }
//   const complaint = complaintResult.data;
//   return {
//     title: `البلاغ: ${complaint.title}`,
//     description: complaint.description,
//   };
// }
