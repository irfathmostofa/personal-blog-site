import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { isSupabaseConfigured } from "@/lib/env";

function withPrivateAdminHeaders(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "private, no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

/**
 * Refreshes the Supabase session on every matched request so Server Components
 * see a valid session. Route-level authorization is enforced server-side in
 * `lib/auth`; this proxy only rotates tokens and marks admin responses private.
 */
export async function proxy(request: NextRequest) {
  let response = withPrivateAdminHeaders(
    request,
    NextResponse.next({ request }),
  );

  if (!isSupabaseConfigured()) return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = withPrivateAdminHeaders(
          request,
          NextResponse.next({ request }),
        );

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.getClaims();
  } catch {
    // A failed refresh should not block public traffic.
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
