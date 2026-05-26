"use server";

import { revalidatePath } from "next/cache";
import { adminPost, AdminApiError } from "@/lib/api";
import type { AdminPlan } from "@/lib/admin-types";

export async function deactivatePlanAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    throw new Error("Missing plan id");
  }

  try {
    await adminPost<AdminPlan>(`/admin/plans/${encodeURIComponent(id)}/deactivate`, {});
  } catch (err) {
    if (err instanceof AdminApiError) {
      throw new Error(`API ${err.status}: ${String(err.body)}`);
    }
    throw err;
  }

  revalidatePath("/plans");
}
