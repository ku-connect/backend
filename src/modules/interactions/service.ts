import { db } from "../../db";
import {
  createInteractions as createInteractionsRepo,
  findInteraction,
  findInteractionLiked,
} from "./repository";

export async function createInteractions(
  from: string,
  to: string,
  liked: boolean
) {
  return createInteractionsRepo(db, from, to, liked); // Maybe onConflict update
}

export async function getInteraction(from: string, to: string) {
  return findInteraction(db, from, to);
}

export async function isConnected(userId1: string, userId2: string) {
  const likedFromUser1 = await findInteractionLiked(db, userId1, userId2, true);

  const likedFromUser2 = await findInteractionLiked(db, userId2, userId1, true);

  return likedFromUser1.length > 0 && likedFromUser2.length > 0;
}
