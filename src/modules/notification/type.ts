import { z } from "zod";

export const readNotificationSchema = z.object({
  notificationIds: z.array(z.string()).min(1),
});

export type ReadNotificationRequest = z.infer<typeof readNotificationSchema>;
