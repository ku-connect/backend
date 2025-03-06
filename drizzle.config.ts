import { defineConfig } from "drizzle-kit";

// console.log(process.env.DATABASE_URL)

export default defineConfig({
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL as string,
	},
	schemaFilter: ["public", "_private", "auth"],
	tablesFilter: [
		"users",
		"profile",
		"interest",
		"user_interest",
		"interaction",
		"notification",
		"chat",
		"settings",
		"message",
	],
});
