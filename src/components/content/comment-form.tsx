"use client";

import { useActionState, type ReactNode } from "react";

import { submitComment, type PublicCommentState } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const INITIAL: PublicCommentState = { status: "idle", message: "" };

export function CommentForm({
  postId,
  parentId,
}: {
  postId: string;
  parentId?: string | null;
}) {
  const [state, formAction, pending] = useActionState(submitComment, INITIAL);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-2xl border border-brand/30 bg-brand-muted/40 px-6 py-6"
      >
        <p className="font-heading text-xl font-semibold tracking-tight">Comment received.</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-4" noValidate>
      <input type="hidden" name="post_id" value={postId} />
      {parentId ? <input type="hidden" name="parent_id" value={parentId} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="author_name" label="Name" error={state.fieldErrors?.author_name}>
          <Input id="author_name" name="author_name" autoComplete="name" required className="h-10" />
        </Field>
        <Field id="author_email" label="Email" error={state.fieldErrors?.author_email}>
          <Input
            id="author_email"
            name="author_email"
            type="email"
            autoComplete="email"
            required
            className="h-10"
          />
        </Field>
      </div>
      <Field id="body" label="Comment" error={state.fieldErrors?.body}>
        <Textarea id="body" name="body" required rows={5} className="min-h-28" />
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
      <p className="text-xs text-muted-foreground">
        Comments are held for review. Email is used only for moderation and is never shown publicly.
      </p>
      <Button type="submit" disabled={pending} className="h-10 px-5">
        {pending ? "Sending…" : "Post comment"}
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
