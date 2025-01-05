import { relations } from "drizzle-orm/relations";
import { usersInAuth, profileInPrivate, interestInPrivate, userInterestInPrivate, interactionsInPrivate } from "./schema";

export const profileInPrivateRelations = relations(profileInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profileInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profileInPrivates: many(profileInPrivate),
	userInterestInPrivates: many(userInterestInPrivate),
	interactionsInPrivates_fromUserId: many(interactionsInPrivate, {
		relationName: "interactionsInPrivate_fromUserId_usersInAuth_id"
	}),
	interactionsInPrivates_toUserId: many(interactionsInPrivate, {
		relationName: "interactionsInPrivate_toUserId_usersInAuth_id"
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

export const interactionsInPrivateRelations = relations(interactionsInPrivate, ({one}) => ({
	usersInAuth_fromUserId: one(usersInAuth, {
		fields: [interactionsInPrivate.fromUserId],
		references: [usersInAuth.id],
		relationName: "interactionsInPrivate_fromUserId_usersInAuth_id"
	}),
	usersInAuth_toUserId: one(usersInAuth, {
		fields: [interactionsInPrivate.toUserId],
		references: [usersInAuth.id],
		relationName: "interactionsInPrivate_toUserId_usersInAuth_id"
	}),
}));