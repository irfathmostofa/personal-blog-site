import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email").max(254),
  password: z.string().min(1, "Password is required").max(128),
  next: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
