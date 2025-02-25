import { z } from "zod";

export const settingsRequestSchema = z.object({
  profileVisibility: z.enum(["public", "private", "connected"]),
  contactInfoVisibility: z.enum(["public", "private", "connected"]),
  notiNewMessage: z.boolean().default(true),
  notiNewConnectionRequest: z.boolean().default(true),
  notiNewConnectionRequestAccept: z.boolean().default(true),
});

export type SettingsRequest = z.infer<typeof settingsRequestSchema>;
