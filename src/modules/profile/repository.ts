import { and, cosineDistance, desc, eq, getTableColumns, inArray, ne, notInArray, sql } from "drizzle-orm";
import { interestInPrivate, profileInPrivate, settingsInPrivate, userInterestInPrivate } from "../../../drizzle/schema";
import { takeUniqueOrThrow, type DB } from "../../db";
import { omit } from "lodash";
import type { CreateProfileRequest, UpdateProfileRequest } from "./type";

export async function findProfilesSimilarityPaginated(
	db: DB,
	page: number,
	size: number,
	profile: any,
	excludeIds: string[]
) {
	const similarity = sql<number>`1 - (${cosineDistance(profileInPrivate.embedding, profile.embedding!)})`;
	const offset = (page - 1) * size;
	const profiles = await db
		.select({
			...omit(getTableColumns(profileInPrivate), ["embedding"]),
			settings: settingsInPrivate,
			similarity,
		})
		.from(profileInPrivate)
		.where(
			and(
				notInArray(profileInPrivate.userId, [profile.userId, ...excludeIds]),
				eq(settingsInPrivate.profileVisibility, "public")
			)
		)
		.orderBy((t) => desc(t.similarity))
		.leftJoin(settingsInPrivate, eq(profileInPrivate.userId, settingsInPrivate.userId))
		.limit(size)
		.offset(offset);

	return profiles;
}

export async function findProfile(db: DB, userId: string) {
	return db.select().from(profileInPrivate).where(eq(profileInPrivate.userId, userId)).then(takeUniqueOrThrow);
}

export async function findProfileWithSettings(db: DB, userId: string) {
	return db
		.select({
			...omit(getTableColumns(profileInPrivate), ["embedding"]),
			settings: omit(getTableColumns(settingsInPrivate), ["userId"]),
		})
		.from(profileInPrivate)
		.where(eq(profileInPrivate.userId, userId))
		.leftJoin(settingsInPrivate, eq(profileInPrivate.userId, settingsInPrivate.userId))
		.then(takeUniqueOrThrow);
}

export async function findUserInterests(db: DB, userId: string) {
	return db
		.select({ id: interestInPrivate.id, name: interestInPrivate.name })
		.from(userInterestInPrivate)
		.innerJoin(interestInPrivate, eq(userInterestInPrivate.interestId, interestInPrivate.id))
		.where(eq(userInterestInPrivate.userId, userId));
}

export async function createProfile(db: DB, profile: CreateProfileRequest, userId: string, embeddings: number[]) {
	return db
		.insert(profileInPrivate)
		.values({
			displayName: profile.displayName,
			bio: profile.bio,
			image: profile.image,
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
		.returning({ insertedId: profileInPrivate.id })
		.then(takeUniqueOrThrow);
}

export async function updateProfile(db: DB, profile: UpdateProfileRequest, userId: string) {
	return db
		.update(profileInPrivate)
		.set({
			displayName: profile.displayName,
			bio: profile.bio,
			birthdate: profile.birthdate?.toDateString(),
			faculty: profile.faculty,
			department: profile.department,
			year: profile.year,
			line: profile.line,
			facebook: profile.facebook,
			instagram: profile.instagram,
			other: profile.other,
			image: profile.image,
		})
		.where(eq(profileInPrivate.userId, userId))
		.returning()
		.then(takeUniqueOrThrow);
}

export async function updateProfileEmbedding(db: DB, userId: string, embeddings: number[]) {
	return db
		.update(profileInPrivate)
		.set({
			embedding: embeddings,
		})
		.where(eq(profileInPrivate.userId, userId));
}

export async function createUserInterests(db: DB, userId: string, interestIds: string[]) {
	return db
		.insert(userInterestInPrivate)
		.values(
			interestIds.map((interestId) => ({
				userId,
				interestId,
			}))
		)
		.onConflictDoNothing();
}

export async function deleteUserInterests(db: DB, userId: string) {
	return db.delete(userInterestInPrivate).where(eq(userInterestInPrivate.userId, userId));
}

export async function findInterests(db: DB) {
	return db.select().from(interestInPrivate);
}

export async function findInterestsByIds(db: DB, interestIds: string[]) {
	return db.select().from(interestInPrivate).where(inArray(interestInPrivate.id, interestIds));
}

export async function findInterestsByUserIds(db: DB, userIds: string[]) {
	return db
		.select({
			id: interestInPrivate.id,
			userId: userInterestInPrivate.userId,
			name: interestInPrivate.name,
		})
		.from(userInterestInPrivate)
		.where(inArray(userInterestInPrivate.userId, userIds))
		.innerJoin(interestInPrivate, eq(userInterestInPrivate.interestId, interestInPrivate.id));
}

export async function findInterestsByUserId(db: DB, userId: string) {
	return db
		.select({
			id: interestInPrivate.id,
			userId: userInterestInPrivate.userId,
			name: interestInPrivate.name,
		})
		.from(userInterestInPrivate)
		.innerJoin(interestInPrivate, eq(userInterestInPrivate.interestId, interestInPrivate.id))
		.where(eq(userInterestInPrivate.userId, userId));
}
