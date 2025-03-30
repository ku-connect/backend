import { z } from "zod";

export const notificationType = {
	INTERACTION: "INTERACTION",
	NEW_CONNECTION: "NEW_CONNECTION",
	WELCOME: "WELCOME",
	NEW_MESSAGE: "NEW_MESSAGE",
};

export const readNotificationSchema = z.object({
	notificationIds: z.array(z.string()).min(1),
});

export type ReadNotificationRequest = z.infer<typeof readNotificationSchema>;
