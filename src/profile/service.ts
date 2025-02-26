import {
  interestInPrivate,
  profileInPrivate,
  userInterestInPrivate,
} from "../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../db";
import { eq } from "drizzle-orm";
import type { ProfileRequest } from "./type";
import { createDefaultUserSettings } from "../settings/service";

export async function getProfiles(page: number, size: number) {
  const offset = (page - 1) * size;
  return db.select().from(profileInPrivate).limit(size).offset(offset);
}

export async function getProfileByUserId(userId: string) {
  return db
    .select()
    .from(profileInPrivate)
    .where(eq(profileInPrivate.userId, userId))
    .then(takeUniqueOrThrow);
}

export async function getProfileWithInterestsByUserId(userId: string) {
  const profile = await getProfileByUserId(userId);

  if (!profile) {
    return null;
  }

  const interests = await db
    .select({ id: interestInPrivate.id, name: interestInPrivate.name })
    .from(userInterestInPrivate)
    .innerJoin(
      interestInPrivate,
      eq(userInterestInPrivate.interestId, interestInPrivate.id)
    )
    .where(eq(userInterestInPrivate.userId, userId));

  return {
    ...profile,
    interests,
  };
}

export async function createProfile(profile: ProfileRequest, userId: string) {
  const interests = profile.interests;
  let insertedId: string | undefined;

  await db.transaction(async (tx) => {
    const insertedIds = await tx
      .insert(profileInPrivate)
      .values({
        displayName: profile.displayName,
        bio: profile.bio,
        birthdate: profile.birthdate?.toISOString(),
        faculty: profile.faculty,
        department: profile.department,
        year: profile.year,
        line: profile.line,
        facebook: profile.facebook,
        instagram: profile.instagram,
        other: profile.other,
        userId,
      })
      .returning({ insertedId: profileInPrivate.id });

    insertedId = insertedIds[0].insertedId;

    if (interests.length > 0) {
      await tx.insert(userInterestInPrivate).values(
        interests.map((interestId) => ({
          userId,
          interestId,
        }))
      );
    }

    await createDefaultUserSettings(userId);
  });

  return insertedId;
}

export async function updateProfile(profile: ProfileRequest, userId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(profileInPrivate)
      .set({
        displayName: profile.displayName,
        bio: profile.bio,
        birthdate: profile.birthdate?.toISOString(),
        faculty: profile.faculty,
        department: profile.department,
        year: profile.year,
        line: profile.line,
        facebook: profile.facebook,
        instagram: profile.instagram,
        other: profile.other,
        userId,
      })
      .where(eq(profileInPrivate.userId, userId));
  });
}

export async function getUserInterests(userId: string) {
  return await db
    .select({
      id: interestInPrivate.id,
      name: interestInPrivate.name,
    })
    .from(userInterestInPrivate)
    .innerJoin(
      interestInPrivate,
      eq(userInterestInPrivate.interestId, interestInPrivate.id)
    )
    .where(eq(userInterestInPrivate.userId, userId));
}

export async function updateUserInterest(userId: string, interests: string[]) {
  await db.transaction(async (tx) => {
    await tx
      .delete(userInterestInPrivate)
      .where(eq(userInterestInPrivate.userId, userId));

    if (interests.length > 0) {
      await tx.insert(userInterestInPrivate).values(
        interests.map((interestId) => ({
          userId,
          interestId,
        }))
      );
    }
  });
}

export async function getInterests() {
  return db.select().from(interestInPrivate);
}