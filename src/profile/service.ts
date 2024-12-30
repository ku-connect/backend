import {
  interestInPrivate,
  profileInPrivate,
  userInterestInPrivate,
} from "../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../db";
import { eq } from "drizzle-orm";
import type { ProfileRequest } from "./type";

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

  await db.transaction(async (tx) => {
    await tx.insert(profileInPrivate).values({
      ...profile,
      userId,
    });

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

export async function updateProfile(profile: ProfileRequest, userId: string) {
  await db.transaction(async (tx) => {
    await tx
      .update(profileInPrivate)
      .set({
        ...profile,
        userId,
      })
      .where(eq(profileInPrivate.userId, userId));
  });
}
