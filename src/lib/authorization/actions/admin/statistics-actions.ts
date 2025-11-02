// src/lib/authorization/actions/admin/statistics-actions.ts
"use server";

import { getCurrentUserId } from "@/lib/authentication/session";
import { getStatisticsData } from "@/lib/authorization/services/admin/statistics-service";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";

export async function getStatisticsAction() {
  try {
    const userId = await getCurrentUserId();
    const statistics = await getStatisticsData(userId);
    return handleSuccess(statistics);
  } catch (error) {
    return handleFailure(error);
  }
}
