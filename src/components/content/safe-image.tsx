import Image from "next/image";

import { getPublicEnv, isSupabaseConfigured } from "@/lib/env";

function isAllowedRemote(src: string): boolean {
  if (src.startsWith("/")) return true;
  if (!isSupabaseConfigured()) return false;
  try {
    const host = new URL(src).hostname;
    const supabaseHost = new URL(getPublicEnv().NEXT_PUBLIC_SUPABASE_URL).hostname;
    return host === supabaseHost;
  } catch {
    return false;
  }
}

export function SafeImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!isAllowedRemote(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} width={width} height={height} />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
