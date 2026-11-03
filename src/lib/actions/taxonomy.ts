"use server";

import { revalidatePath } from "next/cache";

import { fail, type ActionResult } from "@/lib/admin/result";
import { countCategoryPosts, countTagPosts } from "@/lib/admin/taxonomy";
import { requireStaff } from "@/lib/auth";
import { revalidateTaxonomy } from "@/lib/cache/revalidate";
import { slugify } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Category, Tag } from "@/lib/types/database";
import {
  categoryCreateSchema,
  categoryUpdateSchema,
  tagCreateSchema,
  tagUpdateSchema,
  taxonomyIdSchema,
} from "@/lib/validations/taxonomy";

function refreshTaxonomyAdmin() {
  revalidateTaxonomy();
  revalidatePath("/admin/categories");
  revalidatePath("/admin/tags");
  revalidatePath("/admin/dashboard");
}

export async function createCategory(input: unknown): Promise<ActionResult<Category>> {
  await requireStaff("/admin/categories");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = categoryCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid category.");
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (!slug) return fail("Add a slug made of lowercase letters, numbers and hyphens.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      image_id: parsed.data.image_id,
      featured: parsed.data.featured,
      sort_order: parsed.data.sort_order,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return fail("That slug is already in use.");
    return fail(error?.message ?? "The category could not be created.");
  }

  refreshTaxonomyAdmin();
  return { status: "success", message: "Category created.", data };
}

export async function updateCategory(input: unknown): Promise<ActionResult<Category>> {
  await requireStaff("/admin/categories");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = categoryUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid category.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      image_id: parsed.data.image_id,
      featured: parsed.data.featured,
      sort_order: parsed.data.sort_order,
    })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return fail("That slug is already in use.");
    return fail(error?.message ?? "The category could not be updated.");
  }

  refreshTaxonomyAdmin();
  return { status: "success", message: "Category saved.", data };
}

export async function deleteCategory(
  id: string,
  confirmed = false,
): Promise<ActionResult> {
  await requireStaff("/admin/categories");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = taxonomyIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid category id.");

  const count = await countCategoryPosts(parsed.data);
  if (count > 0 && !confirmed) {
    return fail(
      `This category is used by ${count} ${count === 1 ? "article" : "articles"}. Confirm to unlink them and delete it.`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  refreshTaxonomyAdmin();
  return {
    status: "success",
    message: count > 0 ? "Category deleted. Linked articles are now uncategorised." : "Category deleted.",
    data: undefined,
  };
}

export async function createTag(input: unknown): Promise<ActionResult<Tag>> {
  await requireStaff("/admin/tags");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = tagCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid tag.");
  }

  const slug = parsed.data.slug || slugify(parsed.data.name);
  if (!slug) return fail("Add a slug made of lowercase letters, numbers and hyphens.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
    })
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return fail("That slug is already in use.");
    return fail(error?.message ?? "The tag could not be created.");
  }

  refreshTaxonomyAdmin();
  return { status: "success", message: "Tag created.", data };
}

export async function updateTag(input: unknown): Promise<ActionResult<Tag>> {
  await requireStaff("/admin/tags");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = tagUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid tag.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
    })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return fail("That slug is already in use.");
    return fail(error?.message ?? "The tag could not be updated.");
  }

  refreshTaxonomyAdmin();
  return { status: "success", message: "Tag saved.", data };
}

export async function deleteTag(id: string, confirmed = false): Promise<ActionResult> {
  await requireStaff("/admin/tags");
  if (!isSupabaseConfigured()) return fail("Supabase is not configured.");

  const parsed = taxonomyIdSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid tag id.");

  const count = await countTagPosts(parsed.data);
  if (count > 0 && !confirmed) {
    return fail(
      `This tag is used by ${count} ${count === 1 ? "article" : "articles"}. Confirm to unlink them and delete it.`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tags").delete().eq("id", parsed.data);
  if (error) return fail(error.message);

  refreshTaxonomyAdmin();
  return {
    status: "success",
    message: count > 0 ? "Tag deleted. It was removed from linked articles." : "Tag deleted.",
    data: undefined,
  };
}
