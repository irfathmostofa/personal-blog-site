"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { CoverImageField } from "@/components/media/cover-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteSettings } from "@/lib/actions/settings";
import type { SettingsPageData } from "@/lib/admin/settings";
import type { SiteSettings } from "@/lib/settings";
import type { MediaAsset } from "@/lib/types/database";

export function SettingsForm({
  data,
  canEdit,
}: {
  data: SettingsPageData;
  canEdit: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [settings, setSettings] = useState<SiteSettings>(data.settings);
  const [logo, setLogo] = useState<MediaAsset | null>(data.media.logo);
  const [favicon, setFavicon] = useState<MediaAsset | null>(data.media.favicon);
  const [og, setOg] = useState<MediaAsset | null>(data.media.og);

  function submit() {
    startTransition(async () => {
      const payload: SiteSettings = {
        ...settings,
        general: {
          ...settings.general,
          logo_media_id: logo?.id ?? null,
          favicon_media_id: favicon?.id ?? null,
        },
        seo: {
          ...settings.seo,
          og_image_id: og?.id ?? null,
        },
      };
      const result = await saveSiteSettings(payload);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <form
      className="space-y-10"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {!data.configured ? (
        <p className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Supabase is not configured. Settings will save once credentials are in place.
        </p>
      ) : null}

      {data.error ? (
        <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
          {data.error}
        </p>
      ) : null}

      {!canEdit ? (
        <p className="rounded-xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Editors can review these values. Only administrators can save changes.
        </p>
      ) : null}

      <Section title="General" caption="Identity shown across the public site.">
        <Field id="site-name" label="Website name">
          <Input
            id="site-name"
            value={settings.general.name}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                general: { ...current.general, name: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="short-name" label="Short name">
          <Input
            id="short-name"
            value={settings.general.short_name}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                general: { ...current.general, short_name: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="tagline" label="Tagline">
          <Input
            id="tagline"
            value={settings.general.tagline}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                general: { ...current.general, tagline: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="description" label="Description">
          <Textarea
            id="description"
            rows={4}
            value={settings.general.description}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                general: { ...current.general, description: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="default-author" label="Default author">
          <select
            id="default-author"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={settings.general.default_author_id ?? ""}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                general: {
                  ...current.general,
                  default_author_id: event.target.value || null,
                },
              }))
            }
          >
            <option value="">Not set</option>
            {data.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.display_name}
              </option>
            ))}
          </select>
        </Field>
        <CoverImageField label="Logo" folder="general" value={logo} onChange={setLogo} />
        <CoverImageField label="Favicon" folder="general" value={favicon} onChange={setFavicon} />
        <div className="grid gap-4 sm:grid-cols-2">
          {(["twitter", "github", "linkedin", "mastodon"] as const).map((network) => (
            <Field key={network} id={network} label={network}>
              <Input
                id={network}
                value={settings.general.social[network]}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    general: {
                      ...current.general,
                      social: { ...current.general.social, [network]: event.target.value },
                    },
                  }))
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      <Section title="SEO" caption="Defaults used when an article does not override them.">
        <Field id="seo-title" label="Default SEO title">
          <Input
            id="seo-title"
            value={settings.seo.default_title}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                seo: { ...current.seo, default_title: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="seo-description" label="Default SEO description">
          <Textarea
            id="seo-description"
            rows={3}
            value={settings.seo.default_description}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                seo: { ...current.seo, default_description: event.target.value },
              }))
            }
          />
        </Field>
        <Field id="canonical" label="Canonical URL">
          <Input
            id="canonical"
            value={settings.seo.canonical_url}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                seo: { ...current.seo, canonical_url: event.target.value },
              }))
            }
          />
        </Field>
        <CoverImageField label="Default Open Graph image" folder="covers" value={og} onChange={setOg} />
      </Section>

      <Section title="Content" caption="Defaults for new articles and reader comments.">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.content.comments_enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                content: { ...current.content, comments_enabled: event.target.checked },
              }))
            }
          />
          Comments enabled by default
        </label>
        <Field id="default-status" label="Default article status">
          <select
            id="default-status"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={settings.content.default_status}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                content: {
                  ...current.content,
                  default_status: event.target.value as SiteSettings["content"]["default_status"],
                },
              }))
            }
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field id="reading-measure" label="Reading measure">
          <select
            id="reading-measure"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={settings.content.reading_measure}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                content: {
                  ...current.content,
                  reading_measure: event.target.value as SiteSettings["content"]["reading_measure"],
                },
              }))
            }
          >
            <option value="narrow">Narrow</option>
            <option value="regular">Regular</option>
            <option value="wide">Wide</option>
          </select>
        </Field>
      </Section>

      <Section title="Appearance" caption="Theme preference stored for the publication, not forced on readers.">
        <Field id="default-theme" label="Default theme">
          <select
            id="default-theme"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={settings.appearance.default_theme}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                appearance: {
                  ...current.appearance,
                  default_theme: event.target.value as SiteSettings["appearance"]["default_theme"],
                },
              }))
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </Field>
        <Field id="accent" label="Accent">
          <select
            id="accent"
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            value={settings.appearance.accent}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                appearance: {
                  ...current.appearance,
                  accent: event.target.value as SiteSettings["appearance"]["accent"],
                },
              }))
            }
          >
            <option value="copper">Copper</option>
            <option value="slate">Slate</option>
            <option value="olive">Olive</option>
          </select>
        </Field>
      </Section>

      <Section title="Newsletter" caption="Signup still ships in Phase 10. These switches are stored now.">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.newsletter.enabled}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                newsletter: { ...current.newsletter, enabled: event.target.checked },
              }))
            }
          />
          Newsletter enabled
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.newsletter.double_opt_in}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                newsletter: { ...current.newsletter, double_opt_in: event.target.checked },
              }))
            }
          />
          Require double opt-in
        </label>
        <Field id="from-name" label="From name">
          <Input
            id="from-name"
            value={settings.newsletter.from_name}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                newsletter: { ...current.newsletter, from_name: event.target.value },
              }))
            }
          />
        </Field>
      </Section>

      <Section title="Analytics" caption="First-party event collection. Unique visitors are not claimed.">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.analytics.collect_views}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                analytics: { ...current.analytics, collect_views: event.target.checked },
              }))
            }
          />
          Collect article view events
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.analytics.collect_likes}
            onChange={(event) =>
              setSettings((current) => ({
                ...current,
                analytics: { ...current.analytics, collect_likes: event.target.checked },
              }))
            }
          />
          Collect likes
        </label>
      </Section>

      <Button type="submit" disabled={pending || !canEdit} className="h-10 px-5">
        {pending ? "Saving…" : "Save settings"}
      </Button>
    </form>
  );
}

function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
