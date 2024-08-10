import type { Config } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
const schemaPath = "./src/database/adapters/drizzle/drizzle-schema.ts";
const migrationPath = "./.drizzle/migrations/";

export default {
	dialect: "postgresql",
	schema: schemaPath,
	out: migrationPath,
	dbCredentials: { url: connectionString },
	verbose: true,
	strict: true
} as Config;
