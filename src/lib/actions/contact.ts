"use server";

import { contactSchema } from "@/lib/validations/contact";
import { isSupabaseConfigured } from "@/lib/env";
import { tryCreatePublicClient } from "@/lib/supabase/public";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    company: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  if (parsed.data.company) {
    return { status: "success", message: "Thanks. Your message has been received." };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message:
        "The contact inbox is not connected yet. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then try again.",
    };
  }

  const client = await tryCreatePublicClient();
  if (!client) {
    return { status: "error", message: "The contact inbox is not connected yet." };
  }

  const { error } = await client.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject,
    message: parsed.data.message,
    is_read: false,
    is_archived: false,
  });

  if (error) {
    return {
      status: "error",
      message: "The message could not be stored. Please try again in a moment.",
    };
  }

  await notifyEmailJs(parsed.data);

  return {
    status: "success",
    message: "Thanks. Your message is with the editor.",
  };
}

async function notifyEmailJs(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return;

  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          from_name: input.name,
          from_email: input.email,
          subject: input.subject,
          message: input.message,
        },
      }),
    });
  } catch {
    // Storage already succeeded; email is a courtesy notification.
  }
}
