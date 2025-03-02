import { db } from "../../db";
import { type SettingsRequest } from "./type";
import {
  createSettings,
  findSettingsByUserId,
  updateSettings,
} from "./repository";

async function getUserSettings(userId: string) {
  return findSettingsByUserId(db, userId);
}

async function createDefaultUserSettings(userId: string) {
  return createSettings(db, userId);
}

async function updateUserSettings(
  settingsRequest: SettingsRequest,
  userId: string
) {
  return updateSettings(db, userId, settingsRequest);
}

export default {
  getUserSettings,
  createDefaultUserSettings,
  updateUserSettings,
};
