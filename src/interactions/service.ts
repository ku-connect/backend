import { interactionsInPrivate } from "../../drizzle/schema";
import { db } from "../db";

export async function createInteractions(
  from: string,
  to: string,
  liked: boolean
) {
  await db
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
