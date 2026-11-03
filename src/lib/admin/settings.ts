import "server-only";

import { connection } from "next/server";

import { isSupabaseConfigured } from "@/lib/env";
import { parseSiteSettings, type SiteSettings } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import type { MediaAsset, Profile } from "@/lib/types/database";

export type SettingsPageData = {
  configured: boolean;
  error: string | null;
  settings: SiteSettings;
  authors: Array<Pick<Profile, "id" | "display_name" | "slug" | "email">>;
  media: {
    logo: MediaAsset | null;
    favicon: MediaAsset | null;
    og: MediaAsset | null;
  };
};

async function loadAsset(
  id: string | null,
): Promise<MediaAsset | null> {
  if (!id || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function getAdminSettings(): Promise<SettingsPageData> {
  await connection();

  const empty: SettingsPageData = {
    configured: false,
    error: null,
    settings: parseSiteSettings([]),
    authors: [],
    media: { logo: null, favicon: null, og: null },
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = await createClient();
  const [settings, authors] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase
      .from("profiles")
      .select("id, display_name, slug, email")
      .order("created_at", { ascending: true }),
  ]);

  if (settings.error) {
    return { ...empty, configured: true, error: settings.error.message };
  }

  const parsed = parseSiteSettings(settings.data ?? []);
  const [logo, favicon, og] = await Promise.all([
    loadAsset(parsed.general.logo_media_id),
    loadAsset(parsed.general.favicon_media_id),
    loadAsset(parsed.seo.og_image_id),
  ]);

  return {
    configured: true,
    error: authors.error?.message ?? null,
    settings: parsed,
    authors: authors.data ?? [],
    media: { logo, favicon, og },
  };
}
