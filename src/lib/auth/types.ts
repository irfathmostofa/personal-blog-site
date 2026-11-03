import type { Profile } from "@/lib/types/database";

export type StaffProfile = Pick<
  Profile,
  "id" | "email" | "display_name" | "slug" | "role" | "bio"
>;

export type StaffSession = {
  userId: string;
  email: string;
  profile: StaffProfile;
};
