import { interactionsInPrivate } from "../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../db";
import { eq, and } from "drizzle-orm";

export async function createInteractions(
  from: string,
  to: string,
  liked: boolean
) {
  return db
    .insert(interactionsInPrivate)
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
    .from(interactionsInPrivate)
    .where(
      and(
        eq(interactionsInPrivate.fromUserId, from),
        eq(interactionsInPrivate.toUserId, to)
      )
    )
    .then(takeUniqueOrThrow);
}
