import { relations } from "drizzle-orm/relations";
import { chatInPrivate, messageInPrivate, usersInAuth, settingsInPrivate, notificationInPrivate, interestInPrivate, userInterestInPrivate, interactionInPrivate } from "./schema";

export const messageInPrivateRelations = relations(messageInPrivate, ({one}) => ({
	chatInPrivate: one(chatInPrivate, {
		fields: [messageInPrivate.chatId],
		references: [chatInPrivate.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [messageInPrivate.authorId],
		references: [usersInAuth.id]
	}),
}));

export const chatInPrivateRelations = relations(chatInPrivate, ({one, many}) => ({
	messageInPrivates: many(messageInPrivate),
	usersInAuth_user1: one(usersInAuth, {
		fields: [chatInPrivate.user1],
		references: [usersInAuth.id],
		relationName: "chatInPrivate_user1_usersInAuth_id"
	}),
	usersInAuth_user2: one(usersInAuth, {
		fields: [chatInPrivate.user2],
		references: [usersInAuth.id],
		relationName: "chatInPrivate_user2_usersInAuth_id"
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	messageInPrivates: many(messageInPrivate),
	chatInPrivates_user1: many(chatInPrivate, {
		relationName: "chatInPrivate_user1_usersInAuth_id"
	}),
	chatInPrivates_user2: many(chatInPrivate, {
		relationName: "chatInPrivate_user2_usersInAuth_id"
	}),
	settingsInPrivates: many(settingsInPrivate),
	notificationInPrivates: many(notificationInPrivate),
	userInterestInPrivates: many(userInterestInPrivate),
	interactionInPrivates_fromUserId: many(interactionInPrivate, {
		relationName: "interactionInPrivate_fromUserId_usersInAuth_id"
	}),
	interactionInPrivates_toUserId: many(interactionInPrivate, {
		relationName: "interactionInPrivate_toUserId_usersInAuth_id"
	}),
}));

export const settingsInPrivateRelations = relations(settingsInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [settingsInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const notificationInPrivateRelations = relations(notificationInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [notificationInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const userInterestInPrivateRelations = relations(userInterestInPrivate, ({one}) => ({
	interestInPrivate: one(interestInPrivate, {
		fields: [userInterestInPrivate.interestId],
		references: [interestInPrivate.id]
	}),
	usersInAuth: one(usersInAuth, {
		fields: [userInterestInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const interestInPrivateRelations = relations(interestInPrivate, ({many}) => ({
	userInterestInPrivates: many(userInterestInPrivate),
}));

export const interactionInPrivateRelations = relations(interactionInPrivate, ({one}) => ({
	usersInAuth_fromUserId: one(usersInAuth, {
		fields: [interactionInPrivate.fromUserId],
		references: [usersInAuth.id],
		relationName: "interactionInPrivate_fromUserId_usersInAuth_id"
	}),
	usersInAuth_toUserId: one(usersInAuth, {
		fields: [interactionInPrivate.toUserId],
		references: [usersInAuth.id],
		relationName: "interactionInPrivate_toUserId_usersInAuth_id"
	}),
}));