import { db } from "../../db";
import { type SettingsRequest } from "./type";
import {
  createSettings,
  findSettingsByUserId,
  updateSettings,
} from "./repository";

export async function getUserSettings(userId: string) {
  return findSettingsByUserId(db, userId);
}

export async function createDefaultUserSettings(userId: string) {
  return createSettings(db, userId);
}

export async function updateUserSettings(
  settingsRequest: SettingsRequest,
  userId: string
) {
  return updateSettings(db, userId, settingsRequest);
}
