"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/authentication/session";
import { handleFailure, handleSuccess } from "@/lib/errors/action-handler";
import { UserService } from "../services/user-service";
import { updateUserProfileSchema } from "../validators/user-validator";

export async function getUserProfileAction() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    const profile = await UserService.getUserProfile(userId);
    return handleSuccess(profile);
  } catch (error) {
    return handleFailure(error);
  }
}

export async function updateUserProfileAction(input: unknown) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized");

    const validated = updateUserProfileSchema.parse(input);
    const updated = await UserService.updateProfile(userId, validated);

    revalidatePath("/profile");
    return handleSuccess({ message: "تم تحديث الملف الشخصي بنجاح", data: updated });
  } catch (error) {
    return handleFailure(error);
  }
}
