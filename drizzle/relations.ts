import { relations } from "drizzle-orm/relations";
import { usersInAuth, profileInPrivate, interestInPrivate, userInterestInPrivate } from "./schema";

export const profileInPrivateRelations = relations(profileInPrivate, ({one}) => ({
	usersInAuth: one(usersInAuth, {
		fields: [profileInPrivate.userId],
		references: [usersInAuth.id]
	}),
}));

export const usersInAuthRelations = relations(usersInAuth, ({many}) => ({
	profileInPrivates: many(profileInPrivate),
	userInterestInPrivates: many(userInterestInPrivate),
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