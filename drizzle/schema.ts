import {
	pgTable,
	pgSchema,
	foreignKey,
	uuid,
	varchar,
	timestamp,
	boolean,
	uniqueIndex,
	index,
	unique,
	check,
	jsonb,
	text,
	smallint,
	date,
	vector,
	primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const _private = pgSchema("_private");
export const auth = pgSchema("auth");
export const visibilityInPrivate = _private.enum("visibility", ["private", "connected", "public"]);
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", ["s256", "plain"]);
export const factorStatusInAuth = auth.enum("factor_status", ["unverified", "verified"]);
export const factorTypeInAuth = auth.enum("factor_type", ["totp", "webauthn", "phone"]);
export const oneTimeTokenTypeInAuth = auth.enum("one_time_token_type", [
	"confirmation_token",
	"reauthentication_token",
	"recovery_token",
	"email_change_token_new",
	"email_change_token_current",
	"phone_change_token",
]);

export const refreshTokensIdSeqInAuth = auth.sequence("refresh_tokens_id_seq", {
	startWith: "1",
	increment: "1",
	minValue: "1",
	maxValue: "9223372036854775807",
	cache: "1",
	cycle: false,
});

export const messageInPrivate = _private.table(
	"message",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		chatId: uuid("chat_id").notNull(),
		authorId: uuid("author_id").notNull(),
		content: varchar({ length: 255 }).notNull(),
		createdTime: timestamp("created_time", { mode: "string" }).defaultNow().notNull(),
		updatedTime: timestamp("updated_time", { mode: "string" }).defaultNow().notNull(),
		isRead: boolean("is_read").default(false).notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.chatId],
			foreignColumns: [chatInPrivate.id],
			name: "message_chat_id_fkey",
		}),
		foreignKey({
			columns: [table.authorId],
			foreignColumns: [usersInAuth.id],
			name: "message_user_id_fkey",
		}),
	]
);

export const usersInAuth = auth.table(
	"users",
	{
		instanceId: uuid("instance_id"),
		id: uuid().primaryKey().notNull(),
		aud: varchar({ length: 255 }),
		role: varchar({ length: 255 }),
		email: varchar({ length: 255 }),
		encryptedPassword: varchar("encrypted_password", { length: 255 }),
		emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true, mode: "string" }),
		invitedAt: timestamp("invited_at", { withTimezone: true, mode: "string" }),
		confirmationToken: varchar("confirmation_token", { length: 255 }),
		confirmationSentAt: timestamp("confirmation_sent_at", { withTimezone: true, mode: "string" }),
		recoveryToken: varchar("recovery_token", { length: 255 }),
		recoverySentAt: timestamp("recovery_sent_at", { withTimezone: true, mode: "string" }),
		emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
		emailChange: varchar("email_change", { length: 255 }),
		emailChangeSentAt: timestamp("email_change_sent_at", { withTimezone: true, mode: "string" }),
		lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true, mode: "string" }),
		rawAppMetaData: jsonb("raw_app_meta_data"),
		rawUserMetaData: jsonb("raw_user_meta_data"),
		isSuperAdmin: boolean("is_super_admin"),
		createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
		updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
		phone: text().default(sql`NULL`),
		phoneConfirmedAt: timestamp("phone_confirmed_at", { withTimezone: true, mode: "string" }),
		phoneChange: text("phone_change").default(""),
		phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(""),
		phoneChangeSentAt: timestamp("phone_change_sent_at", { withTimezone: true, mode: "string" }),
		confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "string" }).generatedAlwaysAs(
			sql`LEAST(email_confirmed_at, phone_confirmed_at)`
		),
		emailChangeTokenCurrent: varchar("email_change_token_current", { length: 255 }).default(""),
		emailChangeConfirmStatus: smallint("email_change_confirm_status").default(0),
		bannedUntil: timestamp("banned_until", { withTimezone: true, mode: "string" }),
		reauthenticationToken: varchar("reauthentication_token", { length: 255 }).default(""),
		reauthenticationSentAt: timestamp("reauthentication_sent_at", { withTimezone: true, mode: "string" }),
		isSsoUser: boolean("is_sso_user").default(false).notNull(),
		deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
		isAnonymous: boolean("is_anonymous").default(false).notNull(),
	},
	(table) => [
		uniqueIndex("confirmation_token_idx")
			.using("btree", table.confirmationToken.asc().nullsLast().op("text_ops"))
			.where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("email_change_token_current_idx")
			.using("btree", table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops"))
			.where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("email_change_token_new_idx")
			.using("btree", table.emailChangeTokenNew.asc().nullsLast().op("text_ops"))
			.where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("reauthentication_token_idx")
			.using("btree", table.reauthenticationToken.asc().nullsLast().op("text_ops"))
			.where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("recovery_token_idx")
			.using("btree", table.recoveryToken.asc().nullsLast().op("text_ops"))
			.where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
		uniqueIndex("users_email_partial_key")
			.using("btree", table.email.asc().nullsLast().op("text_ops"))
			.where(sql`(is_sso_user = false)`),
		index("users_instance_id_email_idx").using("btree", sql`instance_id`, sql`null`),
		index("users_instance_id_idx").using("btree", table.instanceId.asc().nullsLast().op("uuid_ops")),
		index("users_is_anonymous_idx").using("btree", table.isAnonymous.asc().nullsLast().op("bool_ops")),
		unique("users_phone_key").on(table.phone),
		check(
			"users_email_change_confirm_status_check",
			sql`(email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)`
		),
	]
);

export const profileInPrivate = _private.table(
	"profile",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		displayName: varchar("display_name", { length: 255 }),
		bio: varchar({ length: 255 }),
		birthdate: date(),
		faculty: varchar({ length: 255 }),
		department: varchar({ length: 255 }),
		year: varchar({ length: 255 }),
		line: varchar({ length: 255 }),
		facebook: varchar({ length: 255 }),
		instagram: varchar({ length: 255 }),
		other: varchar({ length: 255 }),
		embedding: vector({ dimensions: 768 }),
		createdTime: timestamp("created_time", { mode: "string" }).defaultNow().notNull(),
		updatedTime: timestamp("updated_time", { mode: "string" }).defaultNow().notNull(),
		image: varchar({ length: 512 }),
	},
	(table) => [
		check(
			"profile_year_check",
			sql`(year)::text = ANY ((ARRAY['1'::character varying, '2'::character varying, '3'::character varying, '4'::character varying, '>4'::character varying])::text[])`
		),
	]
);

export const chatInPrivate = _private.table(
	"chat",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		user1: uuid("user_1").notNull(),
		user2: uuid("user_2").notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.user1],
			foreignColumns: [usersInAuth.id],
			name: "room_user_1_fkey",
		}),
		foreignKey({
			columns: [table.user2],
			foreignColumns: [usersInAuth.id],
			name: "room_user_2_fkey",
		}),
	]
);

export const interestInPrivate = _private.table("interest", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
});

export const settingsInPrivate = _private.table(
	"settings",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		profileVisibility: visibilityInPrivate("profile_visibility").default("public").notNull(),
		contactInfoVisibility: visibilityInPrivate("contact_info_visibility").default("connected").notNull(),
		notiNewMessage: boolean("noti_new_message").default(true).notNull(),
		notiNewConnectionRequest: boolean("noti_new_connection_request").default(true).notNull(),
		notiNewConnectionRequestAccept: boolean("noti_new_connection_request_accept").default(true).notNull(),
		createdTime: timestamp("created_time", { mode: "string" }).defaultNow().notNull(),
		updatedTime: timestamp("updated_time", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "settings_user_id_fkey",
		}),
		unique("settings_user_id_key").on(table.userId),
	]
);

export const notificationInPrivate = _private.table(
	"notification",
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		userId: uuid("user_id").notNull(),
		data: jsonb().notNull(),
		type: varchar({ length: 255 }).notNull(),
		readAt: timestamp("read_at", { mode: "string" }),
		createdTime: timestamp("created_time", { mode: "string" }).defaultNow().notNull(),
		updatedTime: timestamp("updated_time", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "notification_user_id_fkey",
		}),
	]
);

export const userInterestInPrivate = _private.table(
	"user_interest",
	{
		interestId: uuid("interest_id").notNull(),
		userId: uuid("user_id").notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.interestId],
			foreignColumns: [interestInPrivate.id],
			name: "user_interest_interest_id_fkey",
		}),
		foreignKey({
			columns: [table.userId],
			foreignColumns: [usersInAuth.id],
			name: "user_interest_user_id_fkey",
		}),
		primaryKey({ columns: [table.interestId, table.userId], name: "user_interest_pkey" }),
	]
);

export const interactionInPrivate = _private.table(
	"interaction",
	{
		fromUserId: uuid("from_user_id").notNull(),
		toUserId: uuid("to_user_id").notNull(),
		liked: boolean().notNull(),
		createdTime: timestamp("created_time", { mode: "string" }).defaultNow().notNull(),
		updatedTime: timestamp("updated_time", { mode: "string" }).defaultNow().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.fromUserId],
			foreignColumns: [usersInAuth.id],
			name: "interaction_from_user_id_fkey",
		}),
		foreignKey({
			columns: [table.toUserId],
			foreignColumns: [usersInAuth.id],
			name: "interaction_to_user_id_fkey",
		}),
		primaryKey({ columns: [table.fromUserId, table.toUserId], name: "interaction_pkey" }),
	]
);
