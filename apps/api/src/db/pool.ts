import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadApiEnv } from "../config/load-env.js";

let pool: Pool | null = null;
let database: ReturnType<typeof drizzle> | null = null;

loadApiEnv();

function readDatabaseUrl(): string {
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("DATABASE_URL is required");
	}

	return databaseUrl;
}

export function getPool(): Pool {
	if (!pool) {
		pool = new Pool({
			connectionString: readDatabaseUrl(),
		});
	}

	return pool;
}

export function getDb() {
	if (!database) {
		database = drizzle({
			client: getPool(),
		});
	}

	return database;
}

export async function closePool() {
	if (!pool) {
		return;
	}

	await pool.end();
	pool = null;
	database = null;
}
