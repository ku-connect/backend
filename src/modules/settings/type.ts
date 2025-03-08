import { z } from "zod";

export const settingsRequestSchema = z.object({
	profileVisibility: z.enum(["public", "private", "connected"]).optional(),
	contactInfoVisibility: z.enum(["public", "private", "connected"]).optional(),
	notiNewMessage: z.boolean().optional(),
	notiNewConnectionRequest: z.boolean().optional(),
	notiNewConnectionRequestAccept: z.boolean().optional(),
});

export type SettingsRequest = z.infer<typeof settingsRequestSchema>;
