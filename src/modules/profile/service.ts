import {
  interestInPrivate,
  profileInPrivate,
  settingsInPrivate,
  userInterestInPrivate,
} from "../../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../../db";
import {
  cosineDistance,
  desc,
  eq,
  getTableColumns,
  inArray,
  sql,
  ne,
} from "drizzle-orm";
import type { ProfileRequest } from "./type";
import { createDefaultUserSettings } from "../settings/service";
import { generateEmbeddings } from "../../utils/embeddings";
import { omit } from "lodash";

export async function getProfiles(page: number, size: number, userId: string) {
  const profile = await getProfileByUserId(userId);

  const similarity = sql<number>`1 - (${cosineDistance(
    profileInPrivate.embedding,
    profile.embedding!
  )})`;
  const offset = (page - 1) * size;

  const { embedding, ...profileColumns } = getTableColumns(profileInPrivate);
  const profiles = await db
    .select({
      ...profileColumns,
      settings: settingsInPrivate,
      similarity,
    })
    .from(profileInPrivate)
    .where(ne(profileInPrivate.userId, userId))
    .orderBy((t) => desc(t.similarity))
    .leftJoin(
      settingsInPrivate,
      eq(profileInPrivate.userId, settingsInPrivate.userId)
    )
    .limit(size)
    .offset(offset);

  const interests = await db
    .select({
      id: interestInPrivate.id,
      userId: userInterestInPrivate.userId,
      name: interestInPrivate.name,
    })
    .from(userInterestInPrivate)
    .where(
      inArray(
        userInterestInPrivate.userId,
        profiles.map((t) => t.userId)
      )
    )
    .innerJoin(
      interestInPrivate,
      eq(userInterestInPrivate.interestId, interestInPrivate.id)
    );

  return {
    profiles: profiles.map((profile) => ({
      ...profile,
      interests: interests
        .filter((interest) => interest.userId === profile.userId)
        .map((interest) => omit(interest, ["userId"])),
    })),
  };
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
    const existingInterests = await getInterestsByIds(interests);
    const embeddings = await generateEmbeddings(
      generatePrompt(existingInterests.map((interest) => interest.name))
    );

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
        embedding: embeddings,
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

function generatePrompt(interests: string[]) {
  return `I interested in ${interests.join(", ")}`;
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

async function getInterestsByIds(interestIds: string[]) {
  return db
    .select()
    .from(interestInPrivate)
    .where(inArray(interestInPrivate.id, interestIds));
}
