"use client";

import { useState } from "react";
import { useUserAssignedComplaints } from "@/lib/complaints/hooks/use-user-complaints";
import { UserComplaintsTable } from "./user-complaints-table";

export function UserComplaintsList() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const {
    data: complaintsResult,
    isLoading,
    error,
  } = useUserAssignedComplaints(pageSize);

  const complaints = complaintsResult?.success ? complaintsResult.data?.items : [];

  return (
    <UserComplaintsTable complaints={complaints || []} isLoading={isLoading} error={error} />
  );
}
