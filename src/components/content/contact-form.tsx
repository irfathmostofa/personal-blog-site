"use client";

import { useActionState, type ReactNode } from "react";

import { submitContact, type ContactState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContact, INITIAL);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand/30 bg-brand-muted/40 px-6 py-8"
      >
        <p className="font-heading text-2xl font-semibold tracking-tight">Message sent.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Name"
          error={state.fieldErrors?.name}
        >
          <Input id="name" name="name" autoComplete="name" required className="h-10" />
        </Field>
        <Field
          id="email"
          label="Email"
          error={state.fieldErrors?.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="h-10"
          />
        </Field>
      </div>
      <Field id="subject" label="Subject" error={state.fieldErrors?.subject}>
        <Input id="subject" name="subject" required className="h-10" />
      </Field>
      <Field id="message" label="Message" error={state.fieldErrors?.message}>
        <Textarea id="message" name="message" required rows={8} className="min-h-40" />
      </Field>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      {state.status === "error" && !state.fieldErrors ? (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10 px-5">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
