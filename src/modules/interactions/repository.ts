import { interactionInPrivate } from "../../../drizzle/schema";
import { takeUniqueOrThrow, type DB } from "../../db";
import { eq, and } from "drizzle-orm";

export async function findInteractionsFromUserId(
  db: DB,
  userId: string,
  liked: boolean
) {
  return db
    .select()
    .from(interactionInPrivate)
    .where(
      and(
        eq(interactionInPrivate.fromUserId, userId),
        eq(interactionInPrivate.liked, liked)
      )
    );
}

export async function findInteraction(db: DB, from: string, to: string) {
  return db
    .select()
    .from(interactionInPrivate)
    .where(
      and(
        eq(interactionInPrivate.fromUserId, from),
        eq(interactionInPrivate.toUserId, to)
      )
    )
    .then(takeUniqueOrThrow);
}

export async function findInteractionLiked(
  db: DB,
  from: string,
  to: string,
  liked: boolean
) {
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

export async function createInteractions(
  db: DB,
  from: string,
  to: string,
  liked: boolean
) {
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
