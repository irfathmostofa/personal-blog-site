import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((value) => value === "" || z.url().safeParse(value).success, "Enter a valid URL");

const optionalUuid = z.uuid().nullable();

export const generalSettingsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  short_name: z.string().trim().min(1).max(24),
  tagline: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(400),
  default_author_id: optionalUuid,
  logo_media_id: optionalUuid,
  favicon_media_id: optionalUuid,
  social: z.object({
    twitter: optionalUrl,
    github: optionalUrl,
    linkedin: optionalUrl,
    mastodon: optionalUrl,
  }),
});

export const seoSettingsSchema = z.object({
  default_title: z.string().trim().min(1).max(80),
  default_description: z.string().trim().min(1).max(400),
  canonical_url: z.url("Enter a valid canonical URL").max(300),
  og_image_id: optionalUuid,
});

export const contentSettingsSchema = z.object({
  comments_enabled: z.boolean(),
  default_status: z.enum(["draft", "published", "scheduled", "archived"]),
  featured_post_ids: z.array(z.uuid()).max(12),
  reading_measure: z.enum(["narrow", "regular", "wide"]),
});

export const appearanceSettingsSchema = z.object({
  default_theme: z.enum(["system", "light", "dark"]),
  accent: z.enum(["copper", "slate", "olive"]),
});

export const newsletterSettingsSchema = z.object({
  enabled: z.boolean(),
  double_opt_in: z.boolean(),
  from_name: z.string().trim().min(1).max(80),
});

export const analyticsSettingsSchema = z.object({
  collect_views: z.boolean(),
  collect_likes: z.boolean(),
});

export const siteSettingsSchema = z.object({
  general: generalSettingsSchema,
  seo: seoSettingsSchema,
  content: contentSettingsSchema,
  appearance: appearanceSettingsSchema,
  newsletter: newsletterSettingsSchema,
  analytics: analyticsSettingsSchema,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
