"use client";

import { Grid3X3, List, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useComplaintsList } from "@/lib/complaints/hooks/use-complaints";
import { ComplaintCard } from "./complaint-card";
import { ComplaintsTable } from "./complaints-table";
import { StatsCards } from "./stats-cards";

export function ComplaintsView() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { data: complaintsResult } = useComplaintsList();

  const complaints = complaintsResult?.success ? complaintsResult.data.items : [];

  const handleViewComplaint = (id: string) => {
    router.push(`/admin/complaints/${id}`);
  };

  const handleCreateComplaint = () => {
    router.push("/admin/complaints/new");
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <StatsCards />

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">جميع الشكاوى</TabsTrigger>
            <TabsTrigger value="open">مفتوحة</TabsTrigger>
            <TabsTrigger value="in_progress">قيد التنفيذ</TabsTrigger>
            <TabsTrigger value="resolved">تم الحل</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-9 px-3"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-9 px-3"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>

            {/* Create Button */}
            <Button onClick={handleCreateComplaint} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              شكوى جديدة
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {viewMode === "list" ? (
            <ComplaintsTable onViewComplaint={handleViewComplaint} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} complaint={complaint} onView={handleViewComplaint} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="open">
          <p>الشكاوى المفتوحة - يمكن تطبيق الفلترة هنا</p>
        </TabsContent>

        <TabsContent value="in_progress">
          <p>الشكاوى قيد التنفيذ - يمكن تطبيق الفلترة هنا</p>
        </TabsContent>

        <TabsContent value="resolved">
          <p>الشكاوى المغلقة - يمكن تطبيق الفلترة هنا</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
