import type { Server } from "socket.io";
import { db } from "../db";
import { notificationInPrivate } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export class NotificationService {
  private io: Server;
  private key = "notification";

  public constructor(io: Server) {
    this.io = io;
  }

  public getMyNotification(userId: string, page: number, size: number) {
    const offset = (page - 1) * size;
    return db
      .select()
      .from(notificationInPrivate)
      .where(eq(notificationInPrivate.userId, userId))
      .orderBy(desc(notificationInPrivate.createdTime))
      .limit(size)
      .offset(offset);
  }

  public async sendNewInteractionNotification(
    fromUserId: string,
    toUserId: string
  ) {
    const notification = {
      userId: toUserId,
      type: "INTERACTION",
      data: {
        title: "Someone Likes You! 💌",
        message: "Explore your connections to find out who.",
      },
      readAt: null,
      createdTime: new Date(),
      updatedTime: new Date(),
    };

    const result = await this.saveNotification(notification);
    console.log(result[0]);

    this.sendNotificationToClient({
      ...result[0],
      id: result[0].id.toString(),
    });
  }

  private saveNotification(data: any) {
    return db.insert(notificationInPrivate).values(data).returning();
  }

  private sendNotificationToClient(data: any) {
    this.io.emit(this.key, data);
  }
}
