export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PostStatus = "draft" | "published" | "scheduled" | "archived";
export type CommentStatus = "pending" | "approved" | "rejected" | "spam";
export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";
export type UserRole = "admin" | "editor";
export type MediaFolder =
  | "covers"
  | "articles"
  | "thumbnails"
  | "avatars"
  | "general";

/**
 * Phase 1 placeholder.
 *
 * The full generated schema (tables, views, enums, functions) is produced in
 * Phase 2 together with `supabase/migrations`. Regenerating this file from the
 * live project is the source of truth:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 */
export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      post_status: PostStatus;
      comment_status: CommentStatus;
      subscriber_status: SubscriberStatus;
      user_role: UserRole;
      media_folder: MediaFolder;
    };
    CompositeTypes: Record<string, never>;
  };
}
