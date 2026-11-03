"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ArticleBody } from "@/components/content/article-body";
import { ArticleEditor } from "@/components/editor/article-editor";
import { CoverImageField } from "@/components/media/cover-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePost } from "@/lib/actions/posts";
import { asTiptapDoc, EMPTY_DOC, type TiptapNode } from "@/lib/article/tiptap";
import { slugify } from "@/lib/format";
import type {
  AdminAuthorOption,
  AdminPostDetail,
  AdminTaxonomyOption,
} from "@/lib/admin/posts";
import type { Json, MediaAsset, PostStatus } from "@/lib/types/database";
import type { PostIntent } from "@/lib/validations/post";
import { cn } from "@/lib/utils";

type Draft = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: TiptapNode;
  cover: MediaAsset | null;
  og: MediaAsset | null;
  categoryId: string;
  tagIds: string[];
  authorId: string;
  featured: boolean;
  editorsPick: boolean;
  trending: boolean;
  commentsEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  scheduledFor: string;
};

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function draftFromPost(post: AdminPostDetail | null, fallbackAuthorId: string): Draft {
  if (!post) {
    return {
      title: "",
      slug: "",
      subtitle: "",
      excerpt: "",
      content: EMPTY_DOC,
      cover: null,
      og: null,
      categoryId: "",
      tagIds: [],
      authorId: fallbackAuthorId,
      featured: false,
      editorsPick: false,
      trending: false,
      commentsEnabled: true,
      seoTitle: "",
      seoDescription: "",
      canonicalUrl: "",
      scheduledFor: "",
    };
  }

  return {
    title: post.title,
    slug: post.slug,
    subtitle: post.subtitle ?? "",
    excerpt: post.excerpt ?? "",
    content: asTiptapDoc(post.content),
    cover: post.cover,
    og: post.og_image,
    categoryId: post.category_id ?? "",
    tagIds: post.tags.map((tag) => tag.id),
    authorId: post.author_id,
    featured: post.featured,
    editorsPick: post.editors_pick,
    trending: post.trending,
    commentsEnabled: post.comments_enabled,
    seoTitle: post.seo_title ?? "",
    seoDescription: post.seo_description ?? "",
    canonicalUrl: post.canonical_url ?? "",
    scheduledFor: toLocalInput(post.scheduled_for),
  };
}

function payloadFromDraft(draft: Draft, intent: PostIntent, id?: string) {
  return {
    id,
    title: draft.title.trim() || "Untitled",
    slug: slugify(draft.slug) || slugify(draft.title),
    subtitle: draft.subtitle,
    excerpt: draft.excerpt,
    content: draft.content,
    cover_id: draft.cover?.id ?? null,
    og_image_id: draft.og?.id ?? null,
    category_id: draft.categoryId || null,
    tag_ids: draft.tagIds,
    author_id: draft.authorId,
    featured: draft.featured,
    editors_pick: draft.editorsPick,
    trending: draft.trending,
    comments_enabled: draft.commentsEnabled,
    seo_title: draft.seoTitle,
    seo_description: draft.seoDescription,
    canonical_url: draft.canonicalUrl,
    scheduled_for: fromLocalInput(draft.scheduledFor),
    intent,
  };
}

export function PostForm({
  post,
  categories,
  tags,
  authors,
  currentUserId,
}: {
  post: AdminPostDetail | null;
  categories: AdminTaxonomyOption[];
  tags: AdminTaxonomyOption[];
  authors: AdminAuthorOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => draftFromPost(post, currentUserId));
  const [slugLocked, setSlugLocked] = useState(Boolean(post));
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [preview, setPreview] = useState(false);
  const [pending, startTransition] = useTransition();
  const generation = useRef(0);
  const draftRef = useRef(draft);
  const postIdRef = useRef(postId);
  const statusRef = useRef(status);
  const timer = useRef<number | null>(null);

  draftRef.current = draft;
  postIdRef.current = postId;
  statusRef.current = status;

  const setField = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveState("dirty");
  }, []);

  const persist = useCallback(
    async (intent: PostIntent, options?: { silent?: boolean }) => {
      const current = draftRef.current;
      if (!current.title.trim() && intent === "autosave") return null;

      const token = ++generation.current;
      if (!options?.silent) setSaveState("saving");

      const result = await savePost(payloadFromDraft(current, intent, postIdRef.current ?? undefined));
      if (token !== generation.current && intent === "autosave") return null;

      if (result.status === "error") {
        setSaveState("error");
        if (!options?.silent) toast.error(result.message);
        return result;
      }

      setPostId(result.data.id);
      postIdRef.current = result.data.id;
      setStatus(result.data.status);
      statusRef.current = result.data.status;
      if (!slugLocked) {
        setDraft((currentDraft) => ({ ...currentDraft, slug: result.data.slug }));
      }
      setSaveState("saved");
      if (!options?.silent && intent !== "autosave") toast.success(result.message);

      if (!post && result.data.id && intent !== "autosave") {
        router.replace(`/admin/posts/${result.data.id}`);
      }
      return result;
    },
    [post, router, slugLocked],
  );

  useEffect(() => {
    if (saveState !== "dirty") return;
    if (statusRef.current === "published") return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist("autosave", { silent: true });
    }, 1800);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [draft, persist, saveState]);

  const onTitle = (value: string) => {
    setDraft((current) => ({
      ...current,
      title: value,
      slug: slugLocked ? current.slug : slugify(value),
    }));
    setSaveState("dirty");
  };

  const busy = pending || saveState === "saving";
  const saveLabel = useMemo(() => {
    if (saveState === "saving") return "Saving";
    if (saveState === "saved") return "Saved";
    if (saveState === "error") return "Save failed";
    if (saveState === "dirty") return "Unsaved changes";
    return status === "draft" ? "Draft" : status;
  }, [saveState, status]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-brand uppercase">
            {post ? "Edit" : "Compose"}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {draft.title.trim() || "Untitled article"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {saveLabel}
            {status !== "draft" ? ` · ${status}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={preview ? "secondary" : "outline"}
            className="h-9 px-3"
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? "Edit" : "Preview"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 px-3"
            disabled={busy}
            onClick={() =>
              startTransition(async () => {
                await persist("save");
              })
            }
          >
            Save
          </Button>
          {status === "published" ? (
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3"
              disabled={busy}
              onClick={() =>
                startTransition(async () => {
                  await persist("unpublish");
                })
              }
            >
              Unpublish
            </Button>
          ) : (
            <Button
              type="button"
              className="h-9 px-3"
              disabled={busy}
              onClick={() =>
                startTransition(async () => {
                  await persist("publish");
                })
              }
            >
              Publish
            </Button>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Field label="Title" htmlFor="title">
            <Input
              id="title"
              value={draft.title}
              onChange={(event) => onTitle(event.target.value)}
              placeholder="A title that earns the click"
              className="h-11 font-heading text-lg"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug" htmlFor="slug">
              <Input
                id="slug"
                value={draft.slug}
                onChange={(event) => {
                  setSlugLocked(true);
                  setField("slug", slugify(event.target.value));
                }}
                placeholder="auto-generated-from-title"
              />
            </Field>
            <Field label="Subtitle" htmlFor="subtitle">
              <Input
                id="subtitle"
                value={draft.subtitle}
                onChange={(event) => setField("subtitle", event.target.value)}
              />
            </Field>
          </div>
          <Field label="Excerpt" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              value={draft.excerpt}
              rows={3}
              onChange={(event) => setField("excerpt", event.target.value)}
            />
          </Field>

          {preview ? (
            <div className="rounded-xl border border-border bg-card px-5 py-8 sm:px-8">
              <p className="text-xs font-semibold tracking-widest text-brand uppercase">
                Live preview
              </p>
              <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
                {draft.title.trim() || "Untitled article"}
              </h2>
              {draft.subtitle ? (
                <p className="mt-3 text-lg text-muted-foreground">{draft.subtitle}</p>
              ) : null}
              <div className="mt-8">
                <ArticleBody content={draft.content as Json} />
              </div>
            </div>
          ) : (
            <ArticleEditor
              value={draft.content}
              disabled={busy && saveState === "saving"}
              onChange={(content) => setField("content", content)}
            />
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-16 lg:self-start">
          <Panel title="Publish">
            <Field label="Schedule for" htmlFor="scheduled">
              <Input
                id="scheduled"
                type="datetime-local"
                value={draft.scheduledFor}
                onChange={(event) => setField("scheduledFor", event.target.value)}
              />
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 px-3"
                disabled={busy || !draft.scheduledFor}
                onClick={() =>
                  startTransition(async () => {
                    await persist("schedule");
                  })
                }
              >
                Schedule
              </Button>
              {status !== "archived" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 px-3"
                  disabled={busy}
                  onClick={() =>
                    startTransition(async () => {
                      await persist("archive");
                    })
                  }
                >
                  Archive
                </Button>
              ) : null}
            </div>
          </Panel>

          <Panel title="Media">
            <CoverImageField
              label="Cover image"
              folder="covers"
              value={draft.cover}
              onChange={(asset) => setField("cover", asset)}
            />
            <CoverImageField
              label="Open Graph image"
              folder="covers"
              value={draft.og}
              onChange={(asset) => setField("og", asset)}
            />
          </Panel>

          <Panel title="Taxonomy">
            <Field label="Category" htmlFor="category">
              <select
                id="category"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={draft.categoryId}
                onChange={(event) => setField("categoryId", event.target.value)}
              >
                <option value="">Uncategorized</option>
                {categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Author" htmlFor="author">
              <select
                id="author"
                className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={draft.authorId}
                onChange={(event) => setField("authorId", event.target.value)}
              >
                {authors.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.display_name}
                  </option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Tags</legend>
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-lg border border-border p-2">
                {tags.length === 0 ? (
                  <p className="px-1 py-2 text-xs text-muted-foreground">
                    No tags yet. Create them in Phase 9.
                  </p>
                ) : (
                  tags.map((tag) => {
                    const checked = draft.tagIds.includes(tag.id);
                    return (
                      <label key={tag.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setField(
                              "tagIds",
                              checked
                                ? draft.tagIds.filter((id) => id !== tag.id)
                                : [...draft.tagIds, tag.id],
                            )
                          }
                        />
                        {tag.name}
                      </label>
                    );
                  })
                )}
              </div>
            </fieldset>
          </Panel>

          <Panel title="Placement">
            <Toggle
              label="Featured"
              checked={draft.featured}
              onChange={(value) => setField("featured", value)}
            />
            <Toggle
              label="Editor's pick"
              checked={draft.editorsPick}
              onChange={(value) => setField("editorsPick", value)}
            />
            <Toggle
              label="Trending"
              checked={draft.trending}
              onChange={(value) => setField("trending", value)}
            />
            <Toggle
              label="Comments enabled"
              checked={draft.commentsEnabled}
              onChange={(value) => setField("commentsEnabled", value)}
            />
          </Panel>

          <Panel title="SEO">
            <Field label="SEO title" htmlFor="seo-title">
              <Input
                id="seo-title"
                value={draft.seoTitle}
                maxLength={70}
                onChange={(event) => setField("seoTitle", event.target.value)}
              />
            </Field>
            <Field label="SEO description" htmlFor="seo-description">
              <Textarea
                id="seo-description"
                value={draft.seoDescription}
                maxLength={160}
                rows={3}
                onChange={(event) => setField("seoDescription", event.target.value)}
              />
            </Field>
            <Field label="Canonical URL" htmlFor="canonical">
              <Input
                id="canonical"
                value={draft.canonicalUrl}
                placeholder="https://"
                onChange={(event) => setField("canonicalUrl", event.target.value)}
              />
            </Field>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-3 text-sm")}>
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}
