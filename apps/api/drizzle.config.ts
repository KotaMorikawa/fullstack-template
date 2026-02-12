import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV !== "production") {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	const localEnvPath = resolve(currentDir, ".env.local");
	const processWithLoader = process as typeof process & {
		loadEnvFile?: (file?: string) => void;
	};

	if (existsSync(localEnvPath)) {
		processWithLoader.loadEnvFile?.(localEnvPath);
	}
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required");
}

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: databaseUrl,
	},
});
