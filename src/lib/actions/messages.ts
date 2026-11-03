"use server";

import { revalidatePath } from "next/cache";

import { fail, type ActionResult } from "@/lib/admin/result";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { ContactMessage } from "@/lib/types/database";
import { messageIdSchema, messagePatchSchema } from "@/lib/validations/message";

function refreshMessages() {
  revalidatePath("/admin/messages");
  revalidatePath("/admin/dashboard");
}

export async function patchMessage(
  input: unknown,
): Promise<ActionResult<ContactMessage>> {
  await requireStaff("/admin/messages");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = messagePatchSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid message update.");

  const patch: { is_read?: boolean; is_archived?: boolean } = {};
  if (parsed.data.is_read !== undefined) patch.is_read = parsed.data.is_read;
  if (parsed.data.is_archived !== undefined) patch.is_archived = parsed.data.is_archived;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .update(patch)
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error || !data) {
    return fail(error?.message ?? "The message could not be updated.");
  }

  refreshMessages();
  return { status: "success", message: "Message updated.", data };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireStaff("/admin/messages");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = messageIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid message id.");

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  refreshMessages();
  return { status: "success", message: "Message deleted.", data: undefined };
}
