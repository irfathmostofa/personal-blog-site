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

type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type Post = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type PostTag = Database["public"]["Tables"]["post_tags"]["Row"];
export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"];
export type Subscriber = Database["public"]["Tables"]["subscribers"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type PostLike = Database["public"]["Tables"]["post_likes"]["Row"];
export type PostView = Database["public"]["Tables"]["post_views"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];

/**
 * Hand-maintained until a live project is available. After applying
 * migrations, regenerate from the project:
 *
 *   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string;
          slug: string;
          bio: string | null;
          role: UserRole;
          avatar_id: string | null;
          website_url: string | null;
          twitter_url: string | null;
          github_url: string | null;
          linkedin_url: string | null;
        } & Timestamps;
        Insert: {
          id: string;
          email: string;
          display_name: string;
          slug: string;
          bio?: string | null;
          role?: UserRole;
          avatar_id?: string | null;
          website_url?: string | null;
          twitter_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string;
          slug?: string;
          bio?: string | null;
          role?: UserRole;
          avatar_id?: string | null;
          website_url?: string | null;
          twitter_url?: string | null;
          github_url?: string | null;
          linkedin_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_avatar_id_fkey";
            columns: ["avatar_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          public_url: string;
          mime_type: string;
          file_size: number;
          original_file_size: number;
          width: number | null;
          height: number | null;
          format: string;
          folder: MediaFolder;
          alt_text: string | null;
          caption: string | null;
          uploaded_by: string;
        } & Timestamps;
        Insert: {
          id?: string;
          filename: string;
          original_filename: string;
          storage_path: string;
          public_url: string;
          mime_type: string;
          file_size: number;
          original_file_size: number;
          width?: number | null;
          height?: number | null;
          format: string;
          folder?: MediaFolder;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          original_filename?: string;
          storage_path?: string;
          public_url?: string;
          mime_type?: string;
          file_size?: number;
          original_file_size?: number;
          width?: number | null;
          height?: number | null;
          format?: string;
          folder?: MediaFolder;
          alt_text?: string | null;
          caption?: string | null;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_id: string | null;
          featured: boolean;
          sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_id?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_id?: string | null;
          featured?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          subtitle: string | null;
          excerpt: string | null;
          content: Json;
          cover_id: string | null;
          og_image_id: string | null;
          category_id: string | null;
          author_id: string;
          status: PostStatus;
          featured: boolean;
          editors_pick: boolean;
          trending: boolean;
          comments_enabled: boolean;
          seo_title: string | null;
          seo_description: string | null;
          canonical_url: string | null;
          reading_time_minutes: number;
          word_count: number;
          like_count: number;
          view_count: number;
          published_at: string | null;
          scheduled_for: string | null;
          search_vector: unknown | null;
        } & Timestamps;
        Insert: {
          id?: string;
          title: string;
          slug: string;
          subtitle?: string | null;
          excerpt?: string | null;
          content?: Json;
          cover_id?: string | null;
          og_image_id?: string | null;
          category_id?: string | null;
          author_id: string;
          status?: PostStatus;
          featured?: boolean;
          editors_pick?: boolean;
          trending?: boolean;
          comments_enabled?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          reading_time_minutes?: number;
          word_count?: number;
          like_count?: number;
          view_count?: number;
          published_at?: string | null;
          scheduled_for?: string | null;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          subtitle?: string | null;
          excerpt?: string | null;
          content?: Json;
          cover_id?: string | null;
          og_image_id?: string | null;
          category_id?: string | null;
          author_id?: string;
          status?: PostStatus;
          featured?: boolean;
          editors_pick?: boolean;
          trending?: boolean;
          comments_enabled?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          canonical_url?: string | null;
          reading_time_minutes?: number;
          word_count?: number;
          like_count?: number;
          view_count?: number;
          published_at?: string | null;
          scheduled_for?: string | null;
          search_vector?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_cover_id_fkey";
            columns: ["cover_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_og_image_id_fkey";
            columns: ["og_image_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      post_tags: {
        Row: {
          post_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          tag_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey";
            columns: ["tag_id"];
            isOneToOne: false;
            referencedRelation: "tags";
            referencedColumns: ["id"];
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          parent_id: string | null;
          author_name: string;
          author_email: string;
          body: string;
          status: CommentStatus;
          ip_hash: string | null;
          user_agent: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          post_id: string;
          parent_id?: string | null;
          author_name: string;
          author_email: string;
          body: string;
          status?: CommentStatus;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          parent_id?: string | null;
          author_name?: string;
          author_email?: string;
          body?: string;
          status?: CommentStatus;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
        ];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          status: SubscriberStatus;
          confirmation_token: string | null;
          confirmed_at: string | null;
          unsubscribed_at: string | null;
          consent_given: boolean;
          source: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          consent_given?: boolean;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          status?: SubscriberStatus;
          confirmation_token?: string | null;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          consent_given?: boolean;
          source?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: {
          id: string;
          post_id: string;
          visitor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          visitor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          visitor_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          visitor_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          visitor_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          visitor_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          visitor_id: string | null;
          referrer: string | null;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          visitor_id?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          visitor_id?: string | null;
          referrer?: string | null;
          viewed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "post_views_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
        } & Timestamps;
        Insert: {
          key: string;
          value?: Json;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "site_settings_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read: boolean;
          is_archived: boolean;
          ip_hash: string | null;
        } & Timestamps;
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          is_read?: boolean;
          is_archived?: boolean;
          ip_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          is_read?: boolean;
          is_archived?: boolean;
          ip_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_post_public: {
        Args: {
          p_status: PostStatus;
          p_published_at: string | null;
        };
        Returns: boolean;
      };
      search_posts: {
        Args: {
          query: string;
          result_limit?: number;
          result_offset?: number;
        };
        Returns: Database["public"]["Tables"]["posts"]["Row"][];
      };
      promote_scheduled_posts: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      confirm_subscription: {
        Args: { token: string };
        Returns: boolean;
      };
      unsubscribe_by_token: {
        Args: { token: string };
        Returns: boolean;
      };
    };
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
