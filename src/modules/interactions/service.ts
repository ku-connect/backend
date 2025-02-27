import { interactionInPrivate } from "../../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../../db";
import { eq, and } from "drizzle-orm";

export async function createInteractions(
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
    .onConflictDoNothing(); // Maybe onConflict update
}

export async function getInteraction(from: string, to: string) {
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
