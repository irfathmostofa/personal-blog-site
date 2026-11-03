"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { EmptyState } from "@/components/content/empty-state";
import { CoverImageField } from "@/components/media/cover-image-field";
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
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/actions/taxonomy";
import type { AdminCategory } from "@/lib/admin/taxonomy";
import { pluralize, slugify } from "@/lib/format";
import type { MediaAsset } from "@/lib/types/database";

type FormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  featured: boolean;
  sort_order: number;
  image: MediaAsset | null;
};

const EMPTY: FormState = {
  name: "",
  slug: "",
  description: "",
  featured: false,
  sort_order: 0,
  image: null,
};

export function CategoryManager({
  items,
  configured,
  error,
}: {
  items: AdminCategory[];
  configured: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [items],
  );

  function openCreate() {
    setForm(EMPTY);
    setSlugTouched(false);
    setOpen(true);
  }

  function openEdit(item: AdminCategory) {
    setForm({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description ?? "",
      featured: item.featured,
      sort_order: item.sort_order,
      image: item.image,
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
      image_id: form.image?.id ?? null,
      featured: form.featured,
      sort_order: form.sort_order,
    };
    startTransition(async () => {
      const result = form.id
        ? await updateCategory(payload)
        : await createCategory(payload);
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
      const result = await deleteCategory(deleting.id, deleting.post_count > 0);
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
      <div className="flex justify-end">
        <Button type="button" onClick={openCreate} className="h-9 px-3">
          New category
        </Button>
      </div>

      {!configured ? (
        <EmptyState
          title="Categories are waiting on a database."
          description="Connect Supabase and apply migrations to create and edit categories."
        />
      ) : null}

      {error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Categories could not be loaded. {error}
        </p>
      ) : null}

      {configured && !error && sorted.length === 0 ? (
        <EmptyState
          title="No categories yet."
          description="Create the first topic. Articles can be assigned to it from the editor."
        />
      ) : null}

      {sorted.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {sorted.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image.public_url}
                      alt={item.image.alt_text || item.name}
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    /{item.slug} · {pluralize(item.post_count, "article")}
                    {item.featured ? " · featured" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => openEdit(item)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleting(item)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit category" : "New category"}</DialogTitle>
            <DialogDescription>
              Name, slug and optional image. Deleting later unlinks articles instead of removing them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
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
              <Label htmlFor="category-slug">Slug</Label>
              <Input
                id="category-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setForm((current) => ({ ...current, slug: event.target.value }));
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category-order">Sort order</Label>
                <Input
                  id="category-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sort_order: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, featured: event.target.checked }))
                  }
                />
                Featured on the homepage
              </label>
            </div>
            <CoverImageField
              label="Category image"
              folder="general"
              value={form.image}
              onChange={(image) => setForm((current) => ({ ...current, image }))}
            />
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
        title="Delete category"
        description={
          deleting && deleting.post_count > 0
            ? `${deleting.name} is used by ${pluralize(deleting.post_count, "article")}. Deleting it will leave those articles uncategorised.`
            : `Delete ${deleting?.name ?? "this category"}? This cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
