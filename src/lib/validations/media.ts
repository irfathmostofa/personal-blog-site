import { z } from "zod";

import { MEDIA_ALLOWED_TYPES, MEDIA_FOLDERS, MEDIA_MAX_INPUT_BYTES } from "@/lib/media/constants";

export const mediaFolderSchema = z.enum(MEDIA_FOLDERS);

export const mediaSortSchema = z.enum([
  "newest",
  "oldest",
  "largest",
  "smallest",
  "name",
]);

export const recordMediaSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  original_filename: z.string().trim().min(1).max(255),
  storage_path: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine(
      (path) => MEDIA_FOLDERS.some((folder) => path.startsWith(`${folder}/`)),
      "Storage path must use an allowed folder prefix.",
    ),
  public_url: z.url(),
  mime_type: z.enum(MEDIA_ALLOWED_TYPES),
  file_size: z.number().int().min(1).max(MEDIA_MAX_INPUT_BYTES),
  original_file_size: z.number().int().min(1).max(MEDIA_MAX_INPUT_BYTES),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  format: z.string().trim().min(1).max(20),
  folder: mediaFolderSchema,
  alt_text: z.string().trim().max(300).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
});

export const updateMediaSchema = z.object({
  id: z.uuid(),
  alt_text: z.string().trim().max(300).nullable(),
  caption: z.string().trim().max(500).nullable(),
  folder: mediaFolderSchema.optional(),
});

export const mediaIdSchema = z.uuid();

export type RecordMediaInput = z.infer<typeof recordMediaSchema>;
export type UpdateMediaInput = z.infer<typeof updateMediaSchema>;
