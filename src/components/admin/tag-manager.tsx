"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AdminFilterBar } from "@/components/admin/filter-bar";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/content/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTag, deleteTag, updateTag } from "@/lib/actions/taxonomy";
import type { AdminTag } from "@/lib/admin/taxonomy";
import { pluralize, slugify } from "@/lib/format";

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
};

const EMPTY: FormState = { name: "", slug: "", description: "" };

export function TagManager({
  items,
  configured,
  error,
}: {
  items: AdminTag[];
  configured: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleting, setDeleting] = useState<AdminTag | null>(null);

  function openCreate() {
    setForm(EMPTY);
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(item: AdminTag) {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
    });
    setSlugTouched(true);
    setOpen(true);
  }

  function submit() {
    const payload = {
      id: form.id,
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description.trim() ? form.description.trim() : null,
    };
    startTransition(async () => {
      const result = form.id ? await updateTag(payload) : await createTag(payload);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setOpen(false);
      router.refresh();
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteTag(deleting.id, deleting.post_count > 0);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDeleting(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <AdminFilterBar placeholder="Search tags" />
        </div>
        <Button type="button" onClick={openCreate} className="h-10 px-3">
          New tag
        </Button>
      </div>

      {!configured ? (
        <EmptyState
          title="Tags are waiting on a database."
          description="Connect Supabase and apply migrations to create and edit tags."
        />
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Tags could not be loaded. {error}
        </p>
      ) : null}

      {configured && !error && items.length === 0 ? (
        <EmptyState
          title="No tags yet."
          description="Create a tag to group related articles. Counts include every linked post."
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  /{item.slug} · {pluralize(item.post_count, "article")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setDeleting(item)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit tag" : "New tag"}</DialogTitle>
            <DialogDescription>
              Tags stay attached through post_tags. Deleting a used tag unlinks it first.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Name</Label>
              <Input
                id="tag-name"
                value={form.name}
                onChange={(event) => {
                  const name = event.target.value;
                  setForm((current) => ({
                    ...current,
                    name,
                    slug: slugTouched ? current.slug : slugify(name),
                  }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-slug">Slug</Label>
              <Input
                id="tag-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: event.target.value }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag-description">Description</Label>
              <Textarea
                id="tag-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={pending || !form.name.trim()}>
              {pending ? "Saving…" : form.id ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(next) => {
          if (!next) setDeleting(null);
        }}
        title="Delete tag"
        description={
          deleting && deleting.post_count > 0
            ? `${deleting.name} is used by ${pluralize(deleting.post_count, "article")}. Deleting it will unlink those articles.`
            : `Delete ${deleting?.name ?? "this tag"}? This cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
