// components/complaints/complaints-list.tsx
"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useComplaintsList } from "@/lib/complaints/hooks/use-complaints";
import type { ComplaintPriorityType, ComplaintStatus } from "@/lib/complaints/types/type-complaints";
import { ComplaintsFilters } from "./complaints-filters";
import { ComplaintsTable } from "./complaints-table";
import { CreateComplaintDialog } from "./create-complaint-dialog";

export function ComplaintsList() {
  const [filters, setFilters] = useState({
    search: "",
    status: undefined as ComplaintStatus | undefined,
    priority: undefined as ComplaintPriorityType | undefined,
    category: "",
    tags: [] as string[],
  });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    data: complaintsResult,
    isLoading,
    error,
  } = useComplaintsList(filters.search, filters.status, filters.priority, filters.category, filters.tags);

  const complaints = complaintsResult?.success ? complaintsResult.data?.items : [];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قائمة الشكاوى</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          إنشاء شكوى جديدة
        </Button>
      </div>

      <ComplaintsFilters filters={filters} onFiltersChange={setFilters} />

      <ComplaintsTable complaints={complaints} isLoading={isLoading} error={error} />

      <CreateComplaintDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  );
}
