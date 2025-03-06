import { and, count, desc, eq, ne, or } from "drizzle-orm";
import { chatInPrivate, messageInPrivate } from "../../../drizzle/schema";
import type { DB } from "../../db";
import type { Message } from "./type";

// message

export async function updateReadStatus(db: DB, chatId: string, userId: string, read: boolean) {
	return db
		.update(messageInPrivate)
		.set({ isRead: read })
		.where(and(eq(messageInPrivate.id, chatId), ne(messageInPrivate.authorId, userId)));
}

export async function updateReadStatusByMessageId(db: DB, messageId: string, read: boolean) {
	return db.update(messageInPrivate).set({ isRead: read }).where(eq(messageInPrivate.id, messageId));
}

export async function getNumberOfUnreadMessagesInChat(db: DB, chatId: string, userId: string) {
	return db
		.select({ count: count(messageInPrivate.id) })
		.from(messageInPrivate)
		.where(
			and(
				eq(messageInPrivate.chatId, chatId),
				ne(messageInPrivate.authorId, userId),
				eq(messageInPrivate.isRead, false)
			)
		);
}

export async function getUnreadMessagesInChat(db: DB, chatId: string, userId: string) {
	return db
		.select()
		.from(messageInPrivate)
		.where(
			and(
				eq(messageInPrivate.chatId, chatId),
				ne(messageInPrivate.authorId, userId),
				eq(messageInPrivate.isRead, false)
			)
		);
}

export async function insertMessage(db: DB, data: Message) {
	return db.insert(messageInPrivate).values(data).returning();
}

export async function getMessagesByChatId(db: DB, chatId: string) {
	return db
		.select()
		.from(messageInPrivate)
		.where(eq(messageInPrivate.chatId, chatId))
		.orderBy(messageInPrivate.createdTime);
}

export async function getLastMessage(db: DB, chatId: string) {
	return db.select().from(messageInPrivate).where(eq(messageInPrivate.chatId, chatId)).orderBy(desc(messageInPrivate.createdTime)).limit(1);
}

// chat

export async function insertChat(db: DB, user1: string, user2: string) {
	console.log("insert Chat", user1, user2, "to db");
	return db
		.insert(chatInPrivate)
		.values({
			user1,
			user2,
		})
		.returning();
}

export async function listChat(db: DB, userId: string) {
	console.log("listChat", userId, "from db");
	return db
		.select()
		.from(chatInPrivate)
		.where(or(eq(chatInPrivate.user1, userId), eq(chatInPrivate.user2, userId)));
}

export async function getChat(db: DB, chatId: string) {
	console.log("getChat", chatId, "from db");
	return db.select().from(chatInPrivate).where(eq(chatInPrivate.id, chatId));
}

export default {
	updateReadStatus,
	updateReadStatusByMessageId,
	getNumberOfUnreadMessagesInChat,
	getUnreadMessagesInChat,
	insertMessage,
	createChat: insertChat,
	listChat,
	getChat,
	getMessagesByChatId,
	getLastMessage,
};
