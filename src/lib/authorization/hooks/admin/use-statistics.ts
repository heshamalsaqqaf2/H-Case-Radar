// src/lib/hooks/use-statistics.ts
"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { getStatisticsAction } from "@/lib/authorization/actions/admin/statistics-actions";

const statisticsOptions = () =>
  queryOptions({
    queryKey: ["statistics"],
    queryFn: () => getStatisticsAction(),
    staleTime: 60 * 1000, // تحديث كل دقيقة
  });

export function useStatistics() {
  return useQuery(statisticsOptions());
}
