import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug: slugSchema,
  description: z.string().trim().max(500).nullable(),
  image_id: z.uuid().nullable(),
  featured: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

export const categoryCreateSchema = categoryInputSchema;

export const categoryUpdateSchema = categoryInputSchema.extend({
  id: z.uuid(),
});

export const tagInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: slugSchema,
  description: z.string().trim().max(400).nullable(),
});

export const tagCreateSchema = tagInputSchema;

export const tagUpdateSchema = tagInputSchema.extend({
  id: z.uuid(),
});

export const taxonomyIdSchema = z.uuid();

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type TagInput = z.infer<typeof tagInputSchema>;
