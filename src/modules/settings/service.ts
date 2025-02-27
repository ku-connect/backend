import { db, takeUniqueOrThrow } from "../../db";
import { settingsInPrivate } from "../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { type SettingsRequest } from "./type";

export async function getUserSettings(userId: string) {
  return db
    .select()
    .from(settingsInPrivate)
    .where(eq(settingsInPrivate.userId, userId))
    .then(takeUniqueOrThrow);
}

export async function createDefaultUserSettings(userId: string) {
  console.log("Create default user settings", userId);
  return db.insert(settingsInPrivate).values({
    userId: userId,
  });
}

export async function updateUserSettings(
  settingsRequest: SettingsRequest,
  userId: string
) {
  return db
    .update(settingsInPrivate)
    .set({
      ...settingsRequest,
    })
    .where(eq(settingsInPrivate.userId, userId))
    .returning()
    .then(takeUniqueOrThrow);
}
