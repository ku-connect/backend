import { relations } from "drizzle-orm/relations";
import { usersInAuth, settingsInPrivate, profileInPrivate, notificationInPrivate, roomInPrivate, chatInPrivate, interestInPrivate, userInterestInPrivate, interactionInPrivate } from "./schema";

export const settingsInPrivateRelations = relations(settingsInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [settingsInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	settingsInPrivates: many(settingsInPrivate),
	profileInPrivates: many(profileInPrivate),
	notificationInPrivates: many(notificationInPrivate),
	roomInPrivates_user1: many(roomInPrivate, {
		relationName: "roomInPrivate_user1_usersInAuth_id"
	}),
	roomInPrivates_user2: many(roomInPrivate, {
		relationName: "roomInPrivate_user2_usersInAuth_id"
	}),
	chatInPrivates: many(chatInPrivate),
	userInterestInPrivates: many(userInterestInPrivate),
	interactionInPrivates_fromUserId: many(interactionInPrivate, {
		relationName: "interactionInPrivate_fromUserId_usersInAuth_id"
	}),
	interactionInPrivates_toUserId: many(interactionInPrivate, {
		relationName: "interactionInPrivate_toUserId_usersInAuth_id"
	}),
}));

export const profileInPrivateRelations = relations(profileInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profileInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const notificationInPrivateRelations = relations(notificationInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [notificationInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const roomInPrivateRelations = relations(roomInPrivate, ({one, many}) => ({
	usersInAuth_user1: one(usersInAuth, {
		fields: [roomInPrivate.user1],
		references: [usersInAuth.id],
		relationName: "roomInPrivate_user1_usersInAuth_id"
	}),
	usersInAuth_user2: one(usersInAuth, {
		fields: [roomInPrivate.user2],
		references: [usersInAuth.id],
		relationName: "roomInPrivate_user2_usersInAuth_id"
	}),
	chatInPrivates: many(chatInPrivate),
}));

export const chatInPrivateRelations = relations(chatInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [chatInPrivate.authorId],
		references: [usersInAuth.id]
	}),
	roomInPrivate: one(roomInPrivate, {
		fields: [chatInPrivate.roomId],
		references: [roomInPrivate.id]
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