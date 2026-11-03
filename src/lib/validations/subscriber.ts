import { z } from "zod";

export const subscriberStatusSchema = z.enum([
  "pending",
  "confirmed",
  "unsubscribed",
]);

export const subscriberIdSchema = z.uuid();

export const updateSubscriberSchema = z.object({
  id: z.uuid(),
  status: subscriberStatusSchema,
});

export type SubscriberStatusInput = z.infer<typeof subscriberStatusSchema>;
