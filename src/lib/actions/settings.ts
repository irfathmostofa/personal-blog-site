"use server";

import { revalidatePath } from "next/cache";

import { fail, type ActionResult } from "@/lib/admin/result";
import { requireStaff } from "@/lib/auth";
import { revalidateSettings } from "@/lib/cache/revalidate";
import { isSupabaseConfigured } from "@/lib/env";
import type { SiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/types/database";
import { siteSettingsSchema } from "@/lib/validations/settings";

function refreshSettings() {
  revalidateSettings();
  revalidatePath("/admin/settings");
}

export async function saveSiteSettings(
  input: unknown,
): Promise<ActionResult<SiteSettings>> {
  const session = await requireStaff("/admin/settings");
  if (session.profile.role !== "admin") {
    return fail("Only administrators can save settings.");
  }
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid settings.");
  }

  const supabase = await createClient();
  const entries = Object.entries(parsed.data) as Array<
    [keyof SiteSettings, SiteSettings[keyof SiteSettings]]
  >;

  for (const [key, value] of entries) {
    const { error } = await supabase.from("site_settings").upsert(
      {
        key,
        value: value as Json,
        updated_by: session.userId,
      },
      { onConflict: "key" },
    );
    if (error) return fail(error.message);
  }

  refreshSettings();
  return { status: "success", message: "Settings saved.", data: parsed.data };
}
