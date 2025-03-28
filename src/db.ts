import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "./config";

const connectionString = config.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { logger: false });

type DatabaseType = typeof db;
type TransactionType = Parameters<Parameters<DatabaseType["transaction"]>[0]>[0];

export type DB = DatabaseType | TransactionType;

// Define this helper somewhere in your codebase:
export const takeUniqueOrThrow = <T extends any[]>(values: T): T[number] => {
	if (!values) {
		return null;
	}
	if (values.length > 1) {
		throw new Error("Found non unique");
	}
	return values[0]!;
};
