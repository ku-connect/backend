import type { Server } from "socket.io";
import { db } from "../../db";
import notificationRepository from "./repository";

export class NotificationService {
  private io: Server;
  private key = "notification";

  constructor(io: Server) {
    this.io = io;
  }

  getMyNotification = async (userId: string, page: number, size: number) => {
    return notificationRepository.findMyNotificationPaginated(
      db,
      userId,
      page,
      size
    );
  };

  readNotifications = async (notificationIds: string[]) => {
    return notificationRepository.readNotifications(db, notificationIds);
  };

  sendNewInteractionNotification = async (
    fromUserId: string,
    toUserId: string
  ) => {
    const notification = {
      userId: toUserId,
      type: "INTERACTION",
      data: {
        title: "Someone Likes You! 💌",
        message: "Explore your connections to find out who.",
      },
      readAt: null,
      createdTime: new Date().toISOString(),
      updatedTime: new Date().toISOString(),
    };

    console.log("New interaction notification");
    const result = await notificationRepository.createNotification(
      db,
      notification
    );

    this.sendNotificationToClient(result);
  };

  private sendNotificationToClient = async (data: any) => {
    this.io.emit(this.key, data);
  };
}
