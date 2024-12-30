import {
  pgTable,
  pgSchema,
  uniqueIndex,
  index,
  unique,
  check,
  uuid,
  varchar,
  timestamp,
  jsonb,
  boolean,
  text,
  smallint,
  foreignKey,
  serial,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const auth = pgSchema("auth");
export const _private = pgSchema("private");
export const aalLevelInAuth = auth.enum("aal_level", ["aal1", "aal2", "aal3"]);
export const codeChallengeMethodInAuth = auth.enum("code_challenge_method", [
  "s256",
  "plain",
]);
export const factorStatusInAuth = auth.enum("factor_status", [
  "unverified",
  "verified",
]);
export const factorTypeInAuth = auth.enum("factor_type", [
  "totp",
  "webauthn",
  "phone",
]);
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

export const usersInAuth = auth.table(
  "users",
  {
    instanceId: uuid("instance_id"),
    id: uuid().primaryKey().notNull(),
    aud: varchar({ length: 255 }),
    role: varchar({ length: 255 }),
    email: varchar({ length: 255 }),
    encryptedPassword: varchar("encrypted_password", { length: 255 }),
    emailConfirmedAt: timestamp("email_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    invitedAt: timestamp("invited_at", { withTimezone: true, mode: "string" }),
    confirmationToken: varchar("confirmation_token", { length: 255 }),
    confirmationSentAt: timestamp("confirmation_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    recoveryToken: varchar("recovery_token", { length: 255 }),
    recoverySentAt: timestamp("recovery_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    emailChangeTokenNew: varchar("email_change_token_new", { length: 255 }),
    emailChange: varchar("email_change", { length: 255 }),
    emailChangeSentAt: timestamp("email_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastSignInAt: timestamp("last_sign_in_at", {
      withTimezone: true,
      mode: "string",
    }),
    rawAppMetaData: jsonb("raw_app_meta_data"),
    rawUserMetaData: jsonb("raw_user_meta_data"),
    isSuperAdmin: boolean("is_super_admin"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }),
    phone: text().default(sql`NULL`),
    phoneConfirmedAt: timestamp("phone_confirmed_at", {
      withTimezone: true,
      mode: "string",
    }),
    phoneChange: text("phone_change").default(""),
    phoneChangeToken: varchar("phone_change_token", { length: 255 }).default(
      ""
    ),
    phoneChangeSentAt: timestamp("phone_change_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      mode: "string",
    }).generatedAlwaysAs(sql`LEAST(email_confirmed_at, phone_confirmed_at)`),
    emailChangeTokenCurrent: varchar("email_change_token_current", {
      length: 255,
    }).default(""),
    emailChangeConfirmStatus: smallint("email_change_confirm_status").default(
      0
    ),
    bannedUntil: timestamp("banned_until", {
      withTimezone: true,
      mode: "string",
    }),
    reauthenticationToken: varchar("reauthentication_token", {
      length: 255,
    }).default(""),
    reauthenticationSentAt: timestamp("reauthentication_sent_at", {
      withTimezone: true,
      mode: "string",
    }),
    isSsoUser: boolean("is_sso_user").default(false).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    isAnonymous: boolean("is_anonymous").default(false).notNull(),
  },
  (table) => [
    uniqueIndex("confirmation_token_idx")
      .using("btree", table.confirmationToken.asc().nullsLast().op("text_ops"))
      .where(sql`((confirmation_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_current_idx")
      .using(
        "btree",
        table.emailChangeTokenCurrent.asc().nullsLast().op("text_ops")
      )
      .where(sql`((email_change_token_current)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("email_change_token_new_idx")
      .using(
        "btree",
        table.emailChangeTokenNew.asc().nullsLast().op("text_ops")
      )
      .where(sql`((email_change_token_new)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("reauthentication_token_idx")
      .using(
        "btree",
        table.reauthenticationToken.asc().nullsLast().op("text_ops")
      )
      .where(sql`((reauthentication_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("recovery_token_idx")
      .using("btree", table.recoveryToken.asc().nullsLast().op("text_ops"))
      .where(sql`((recovery_token)::text !~ '^[0-9 ]*$'::text)`),
    uniqueIndex("users_email_partial_key")
      .using("btree", table.email.asc().nullsLast().op("text_ops"))
      .where(sql`(is_sso_user = false)`),
    index("users_instance_id_email_idx").using(
      "btree",
      sql`instance_id`,
      sql`null`
    ),
    index("users_instance_id_idx").using(
      "btree",
      table.instanceId.asc().nullsLast().op("uuid_ops")
    ),
    index("users_is_anonymous_idx").using(
      "btree",
      table.isAnonymous.asc().nullsLast().op("bool_ops")
    ),
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
    id: serial().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 255 }),
    bio: varchar({ length: 512 }),
    birthdate: date(),
    faculty: varchar({ length: 255 }).notNull(),
    department: varchar({ length: 255 }).notNull(),
    year: varchar({ length: 255 }).notNull(),
    line: varchar({ length: 255 }),
    facebook: varchar({ length: 255 }),
    instagram: varchar({ length: 255 }),
    other: varchar({ length: 255 }),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "profile_user_id_fkey",
    }).onDelete("cascade"),
  ]
);

export const interestInPrivate = _private.table("interest", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }),
});

export const userInterestInPrivate = _private.table(
  "user_interest",
  {
    userId: uuid("user_id").notNull(),
    interestId: serial("interest_id").notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.interestId],
      foreignColumns: [interestInPrivate.id],
      name: "user_interest_interest_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [usersInAuth.id],
      name: "user_interest_user_id_fkey",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.interestId],
      name: "user_interest_pkey",
    }),
  ]
);
