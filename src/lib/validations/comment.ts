import { z } from "zod";

export const commentStatusSchema = z.enum(["pending", "approved", "rejected", "spam"]);

export const publicCommentSchema = z.object({
  post_id: z.uuid(),
  parent_id: z.uuid().nullable().optional(),
  author_name: z.string().trim().min(1, "Name is required").max(80),
  author_email: z.email("Enter a valid email").max(254),
  body: z.string().trim().min(8, "Write at least 8 characters").max(5000),
  company: z.string().optional().default(""),
});

export const moderateCommentSchema = z.object({
  id: z.uuid(),
  status: commentStatusSchema,
});

export const commentIdSchema = z.uuid();

export type PublicCommentInput = z.infer<typeof publicCommentSchema>;
export type CommentStatusInput = z.infer<typeof commentStatusSchema>;
