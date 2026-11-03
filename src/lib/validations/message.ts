import { z } from "zod";

export const messageIdSchema = z.uuid();

export const messagePatchSchema = z.object({
  id: z.uuid(),
  is_read: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});
