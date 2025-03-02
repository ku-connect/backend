import { notificationInPrivate } from "../../../drizzle/schema";
import { takeUniqueOrThrow, type DB } from "../../db";
import { eq, desc, inArray } from "drizzle-orm";

async function findMyNotificationPaginated(
  db: DB,
  userId: string,
  page: number,
  size: number
) {
  const offset = (page - 1) * size;
  return db
    .select()
    .from(notificationInPrivate)
    .where(eq(notificationInPrivate.userId, userId))
    .orderBy(desc(notificationInPrivate.createdTime))
    .limit(size)
    .offset(offset);
}

async function createNotification(db: DB, data: any) {
  return db
    .insert(notificationInPrivate)
    .values(data)
    .returning()
    .then(takeUniqueOrThrow);
}

async function readNotifications(db: DB, notificationIds: string[]) {
  return db
    .update(notificationInPrivate)
    .set({
      readAt: new Date().toISOString(),
    })
    .where(inArray(notificationInPrivate.id, notificationIds));
}

export default {
  findMyNotificationPaginated,
  createNotification,
  readNotifications,
};
