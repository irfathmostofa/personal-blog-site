import { SITE } from "@/lib/constants";
import { getSiteUrl } from "@/lib/env";
import type { Json } from "@/lib/types/database";
import {
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/validations/settings";

export type SiteSettings = SiteSettingsInput;

export function defaultSiteSettings(): SiteSettings {
  return {
    general: {
      name: SITE.name,
      short_name: SITE.shortName,
      tagline: SITE.tagline,
      description: SITE.description,
      default_author_id: null,
      logo_media_id: null,
      favicon_media_id: null,
      social: {
        twitter: "",
        github: "",
        linkedin: "",
        mastodon: "",
      },
    },
    seo: {
      default_title: SITE.name,
      default_description: SITE.description,
      canonical_url: getSiteUrl(),
      og_image_id: null,
    },
    content: {
      comments_enabled: true,
      default_status: "draft",
      featured_post_ids: [],
      reading_measure: "narrow",
    },
    appearance: {
      default_theme: "system",
      accent: "copper",
    },
    newsletter: {
      enabled: true,
      double_opt_in: true,
      from_name: SITE.name,
    },
    analytics: {
      collect_views: true,
      collect_likes: true,
    },
  };
}

function asRecord(value: Json | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function mergeSection<K extends keyof SiteSettings>(
  key: K,
  stored: Record<string, unknown>,
  fallback: SiteSettings[K],
): SiteSettings[K] {
  const parsed = siteSettingsSchema.shape[key].safeParse({
    ...fallback,
    ...stored,
  });
  return (parsed.success ? parsed.data : fallback) as SiteSettings[K];
}

export function parseSiteSettings(
  rows: Array<{ key: string; value: Json }>,
): SiteSettings {
  const defaults = defaultSiteSettings();
  const byKey = new Map(rows.map((row) => [row.key, asRecord(row.value)]));

  return {
    general: mergeSection("general", byKey.get("general") ?? {}, defaults.general),
    seo: mergeSection("seo", byKey.get("seo") ?? {}, defaults.seo),
    content: mergeSection("content", byKey.get("content") ?? {}, defaults.content),
    appearance: mergeSection(
      "appearance",
      byKey.get("appearance") ?? {},
      defaults.appearance,
    ),
    newsletter: mergeSection(
      "newsletter",
      byKey.get("newsletter") ?? {},
      defaults.newsletter,
    ),
    analytics: mergeSection(
      "analytics",
      byKey.get("analytics") ?? {},
      defaults.analytics,
    ),
  };
}
