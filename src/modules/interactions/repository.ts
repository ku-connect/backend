import { interactionInPrivate, profileInPrivate } from "../../../drizzle/schema";
import { takeUniqueOrThrow, type DB } from "../../db";
import { eq, and, count, isNull } from "drizzle-orm";

export async function findInteractionsFromUserId(db: DB, userId: string) {
	return db
		.select()
		.from(interactionInPrivate)
		.where(and(eq(interactionInPrivate.fromUserId, userId)));
}

export async function findInteraction(db: DB, from: string, to: string) {
	return db
		.select()
		.from(interactionInPrivate)
		.where(and(eq(interactionInPrivate.fromUserId, from), eq(interactionInPrivate.toUserId, to)))
		.then(takeUniqueOrThrow);
}

/**
 * Pending interactions are interactions that have not been liked or disliked by the user
 */
export async function findPendingInteractions(db: DB, userId: string, limit: number = 5) {
	const interacted = db
		.select({ toUserId: interactionInPrivate.toUserId })
		.from(interactionInPrivate)
		.where(and(eq(interactionInPrivate.fromUserId, userId)))
		.as("interacted");

	return db
		.select({
			userId: interactionInPrivate.fromUserId,
			displayName: profileInPrivate.displayName,
			image: profileInPrivate.image,
		})
		.from(interactionInPrivate)
		.leftJoin(interacted, eq(interactionInPrivate.fromUserId, interacted.toUserId))
		.innerJoin(profileInPrivate, eq(interactionInPrivate.fromUserId, profileInPrivate.userId))
		.where(
			and(isNull(interacted.toUserId), eq(interactionInPrivate.toUserId, userId), eq(interactionInPrivate.liked, true))
		)
		.limit(limit);
}

/**
 * Pending interactions are interactions that have not been liked or disliked by the user
 */
export async function countPendingInteractions(db: DB, userId: string) {
	const interacted = db
		.select({ toUserId: interactionInPrivate.toUserId })
		.from(interactionInPrivate)
		.where(and(eq(interactionInPrivate.fromUserId, userId)))
		.as("interacted");

	return db
		.select({ count: count() })
		.from(interactionInPrivate)
		.leftJoin(interacted, eq(interactionInPrivate.fromUserId, interacted.toUserId))
		.where(
			and(isNull(interacted.toUserId), eq(interactionInPrivate.toUserId, userId), eq(interactionInPrivate.liked, true))
		)
		.then(takeUniqueOrThrow);
}

export async function findInteractionLiked(db: DB, from: string, to: string, liked: boolean) {
	return db
		.select()
		.from(interactionInPrivate)
		.where(
			and(
				eq(interactionInPrivate.fromUserId, from),
				eq(interactionInPrivate.toUserId, to),
				eq(interactionInPrivate.liked, liked)
			)
		);
}

export async function createInteractions(db: DB, from: string, to: string, liked: boolean) {
	return db
		.insert(interactionInPrivate)
		.values({
			fromUserId: from,
			toUserId: to,
			liked,
			createdTime: new Date().toISOString(),
			updatedTime: new Date().toISOString(),
		})
		.onConflictDoNothing();
}
