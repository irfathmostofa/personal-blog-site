import { z } from "zod";

export const postStatusSchema = z.enum([
  "draft",
  "published",
  "scheduled",
  "archived",
]);

export const postIntentSchema = z.enum([
  "autosave",
  "save",
  "publish",
  "schedule",
  "unpublish",
  "archive",
]);

export const postSortSchema = z.enum([
  "updated",
  "newest",
  "oldest",
  "title",
  "views",
]);

const emptyToNull = (value: unknown) => {
  if (value == null) return null;
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
};

export const tiptapDocSchema = z
  .object({
    type: z.literal("doc"),
  })
  .passthrough();

export const postWriteSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(1, "Title is required.").max(200),
  slug: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$|^$/, "Use lowercase letters, numbers and hyphens."),
  subtitle: z.preprocess(emptyToNull, z.string().max(300).nullable()),
  excerpt: z.preprocess(emptyToNull, z.string().max(500).nullable()),
  content: tiptapDocSchema,
  cover_id: z.uuid().nullable(),
  og_image_id: z.uuid().nullable(),
  category_id: z.uuid().nullable(),
  tag_ids: z.array(z.uuid()).max(24),
  author_id: z.uuid(),
  featured: z.boolean(),
  editors_pick: z.boolean(),
  trending: z.boolean(),
  comments_enabled: z.boolean(),
  seo_title: z.preprocess(emptyToNull, z.string().max(70).nullable()),
  seo_description: z.preprocess(emptyToNull, z.string().max(160).nullable()),
  canonical_url: z.preprocess(emptyToNull, z.union([z.url(), z.null()])),
  scheduled_for: z.preprocess(emptyToNull, z.iso.datetime().nullable()),
  intent: postIntentSchema,
});

export const postIdSchema = z.uuid();

export type PostWriteInput = z.infer<typeof postWriteSchema>;
export type PostIntent = z.infer<typeof postIntentSchema>;
export type AdminPostSort = z.infer<typeof postSortSchema>;
