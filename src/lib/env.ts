import { z } from "zod";

const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_ANON_KEY = "placeholder-anon-key";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url("must be a valid URL"),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

let cached: PublicEnv | null = null;

function readRawEnv() {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  };
}

export function isSupabaseConfigured(): boolean {
  const raw = readRawEnv();
  const url = raw.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = raw.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.length > 0 &&
    key.length > 0 &&
    url !== PLACEHOLDER_URL &&
    key !== PLACEHOLDER_ANON_KEY &&
    !key.startsWith("your-")
  );
}

export function getPublicEnv(): PublicEnv {
  if (cached) return cached;

  const raw = readRawEnv();
  const parsed = publicEnvSchema.safeParse(raw);

  if (!parsed.success) {
    if (!isSupabaseConfigured()) {
      cached = {
        NEXT_PUBLIC_SUPABASE_URL: PLACEHOLDER_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: PLACEHOLDER_ANON_KEY,
        NEXT_PUBLIC_SITE_URL: raw.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      };
      return cached;
    }

    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid environment variables:\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

export function getSiteUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Copy .env.example to .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const env = getPublicEnv();
  return {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}
