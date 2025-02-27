import { usersInAuth } from "../../../drizzle/schema";
import { db, takeUniqueOrThrow } from "../../db";
import { eq } from "drizzle-orm";

export async function getUserById(userId: string) {
  return db
    .select()
    .from(usersInAuth)
    .where(eq(usersInAuth.id, userId))
    .then(takeUniqueOrThrow);
}
