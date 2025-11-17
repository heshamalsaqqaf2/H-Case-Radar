// app/admin/complaints/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComplaintByIdAction } from "@/lib/complaints/actions/complaints-actions";
import { ComplaintDetail } from "../components/complaint-detail";

interface ComplaintPageProps {
  params: Promise<{
    id: string;
  }>;
}

// ✅ التعديل الأول: إضافة await في generateMetadata
export async function generateMetadata({ params }: ComplaintPageProps): Promise<Metadata> {
  const { id } = await params; // <-- إضافة await هنا
  const complaintResult = await getComplaintByIdAction({ complaintId: id });

  if (!complaintResult.success || !complaintResult.data) {
    return {
      title: "شكوى غير موجودة",
    };
  }

  const complaint = complaintResult.data;

  return {
    title: `شكوى: ${complaint.title}`,
    description: complaint.description,
  };
}

// ✅ التعديل الثاني: إضافة await في المكون الرئيسي
export default async function ComplaintPage({ params }: ComplaintPageProps) {
  const { id } = await params; // <-- إضافة await هنا

  const complaintResult = await getComplaintByIdAction({ complaintId: id });

  if (!complaintResult.success || !complaintResult.data) {
    notFound();
  }

  return (
    <div className="container py-6">
      <ComplaintDetail complaintId={id} /> {/* <-- استخدام id هنا */}
    </div>
  );
}
