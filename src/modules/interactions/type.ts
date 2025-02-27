import { z } from "zod";

export const interactionRequestSchema = z.object({
  toUserId: z.string(),
  liked: z.boolean(),
});

export type InteractionRequest = z.infer<typeof interactionRequestSchema>;
