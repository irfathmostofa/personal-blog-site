import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { loginRedirect } from "@/lib/auth/paths";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserRole } from "@/lib/types/database";

export type StaffProfile = Pick<
  Profile,
  "id" | "email" | "display_name" | "slug" | "role" | "bio"
>;

export type StaffSession = {
  userId: string;
  email: string;
  profile: StaffProfile;
};

const STAFF_ROLES: readonly UserRole[] = ["admin", "editor"];

const PROFILE_COLUMNS =
  "id, email, display_name, slug, role, bio" as const;

function isStaffRole(role: string): role is UserRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

/**
 * Request-deduped staff session. Always dynamic: reads cookies via the
 * user-scoped Supabase client. Returns null when unconfigured, unsigned-in,
 * or when the profile is missing / not staff.
 */
export const getStaffSession = cache(
  async (): Promise<StaffSession | null> => {
    await connection();

    if (!isSupabaseConfigured()) return null;

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || !isStaffRole(profile.role)) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email ?? profile.email,
      profile,
    };
  },
);

export async function requireStaff(
  nextPath?: string,
): Promise<StaffSession> {
  const session = await getStaffSession();
  if (!session) {
    redirect(loginRedirect(nextPath));
  }
  return session;
}

export async function requireAdmin(
  nextPath?: string,
): Promise<StaffSession> {
  const session = await requireStaff(nextPath);
  if (session.profile.role !== "admin") {
    redirect("/admin/dashboard");
  }
  return session;
}
