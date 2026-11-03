"use server";

import { revalidatePath } from "next/cache";

import { fail, type ActionResult } from "@/lib/admin/result";
import { requireStaff } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Subscriber, SubscriberStatus } from "@/lib/types/database";
import {
  subscriberIdSchema,
  updateSubscriberSchema,
} from "@/lib/validations/subscriber";

function refreshSubscribers() {
  revalidatePath("/admin/subscribers");
  revalidatePath("/admin/dashboard");
}

function stampFor(status: SubscriberStatus) {
  if (status === "confirmed") {
    return {
      status,
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
      confirmation_token: null,
    };
  }
  if (status === "unsubscribed") {
    return {
      status,
      unsubscribed_at: new Date().toISOString(),
      confirmation_token: null,
    };
  }
  return { status };
}

export async function updateSubscriber(
  input: unknown,
): Promise<ActionResult<Subscriber>> {
  await requireStaff("/admin/subscribers");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = updateSubscriberSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid subscriber update.");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscribers")
    .update(stampFor(parsed.data.status))
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error || !data) {
    return fail(error?.message ?? "The subscriber could not be updated.");
  }

  refreshSubscribers();
  return { status: "success", message: `Marked as ${parsed.data.status}.`, data };
}

export async function exportSubscribersCsv(
  status: SubscriberStatus | "",
): Promise<ActionResult<string>> {
  await requireStaff("/admin/subscribers");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const supabase = await createClient();
  let request = supabase
    .from("subscribers")
    .select("email, name, status, consent_given, source, confirmed_at, unsubscribed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (status) request = request.eq("status", status);

  const { data, error } = await request;
  if (error) return fail(error.message);

  const header = [
    "email",
    "name",
    "status",
    "consent_given",
    "source",
    "confirmed_at",
    "unsubscribed_at",
    "created_at",
  ];
  const rows = (data ?? []).map((row) =>
    [
      row.email,
      row.name ?? "",
      row.status,
      row.consent_given ? "true" : "false",
      row.source ?? "",
      row.confirmed_at ?? "",
      row.unsubscribed_at ?? "",
      row.created_at,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...rows].join("\n");
  return { status: "success", message: `${rows.length} rows exported.`, data: csv };
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  await requireStaff("/admin/subscribers");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = subscriberIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid subscriber id.");

  const supabase = await createClient();
  const { error } = await supabase.from("subscribers").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  refreshSubscribers();
  return { status: "success", message: "Subscriber removed.", data: undefined };
}
