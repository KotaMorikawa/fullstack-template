import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closePool, getDb } from "./pool.js";

async function runMigrations() {
	const currentDir = dirname(fileURLToPath(import.meta.url));
	const migrationsFolder = resolve(currentDir, "../../drizzle");

	await migrate(getDb(), { migrationsFolder });
	console.log("Database migrations completed.");
}

runMigrations()
	.catch((error) => {
		console.error("Database migration failed.");
		console.error(error instanceof Error ? error.message : error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await closePool();
	});
