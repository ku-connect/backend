import { eq } from "drizzle-orm";
import { settingsInPrivate } from "../../../drizzle/schema";
import { takeUniqueOrThrow, type DB } from "../../db";
import type { SettingsRequest } from "./type";

export async function findSettingsByUserId(db: DB, userId: string) {
  return db
    .select()
    .from(settingsInPrivate)
    .where(eq(settingsInPrivate.userId, userId))
    .then(takeUniqueOrThrow);
}

export async function createSettings(db: DB, userId: string) {
  return db.insert(settingsInPrivate).values({
    userId: userId,
  });
}

export async function updateSettings(
  db: DB,
  userId: string,
  settings: SettingsRequest
) {
  return db
    .update(settingsInPrivate)
    .set({
      ...settings,
    })
    .where(eq(settingsInPrivate.userId, userId))
    .returning()
    .then(takeUniqueOrThrow);
}
