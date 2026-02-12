import { loadApiEnv } from "./load-env.js";

const DEFAULT_PORT = 3000;

loadApiEnv();

function readRequiredEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`${name} is required`);
	}

	return value;
}

function parsePort(value: string | undefined): number {
	if (!value) {
		return DEFAULT_PORT;
	}

	const parsed = Number(value);

	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error("PORT must be a positive integer");
	}

	return parsed;
}

export const env = {
	DATABASE_URL: readRequiredEnv("DATABASE_URL"),
	PORT: parsePort(process.env.PORT),
};
