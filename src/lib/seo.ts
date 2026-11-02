import type { Metadata } from "next";

import { getSiteUrl } from "@/lib/env";
import { SITE } from "@/lib/constants";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
};

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildMetadata({
  title,
  description = SITE.description,
  path = "/",
  image,
  type = "website",
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
}: BuildMetadataOptions = {}): Metadata {
  const resolvedTitle = title ? `${title} | ${SITE.name}` : SITE.name;
  const url = absoluteUrl(path);
  const images = image ? [{ url: image, alt: title ?? SITE.name }] : undefined;

  return {
    title: { absolute: resolvedTitle },
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type,
      title: resolvedTitle,
      description,
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      images,
      ...(type === "article" && publishedTime
        ? { publishedTime, modifiedTime, authors }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function jsonLdScript(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
