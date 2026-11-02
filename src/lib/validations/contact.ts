import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.email("Enter a valid email").max(254),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(20, "Write at least 20 characters").max(8000),
  company: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
