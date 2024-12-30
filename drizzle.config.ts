import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  schemaFilter: ["public", "private", "auth"],
  tablesFilter: ["users", "profile", "interest", "user_interest"],
});
