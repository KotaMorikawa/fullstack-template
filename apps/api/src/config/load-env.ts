import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let envLoaded = false;

function loadEnvFile(path: string) {
	const processWithLoader = process as typeof process & {
		loadEnvFile?: (file?: string) => void;
	};

	processWithLoader.loadEnvFile?.(path);
}

export function loadApiEnv() {
	if (envLoaded) {
		return;
	}

	envLoaded = true;

	if (process.env.NODE_ENV === "production") {
		return;
	}

	const currentDir = dirname(fileURLToPath(import.meta.url));
	const localEnvPath = resolve(currentDir, "../../.env.local");

	if (!existsSync(localEnvPath)) {
		return;
	}

	loadEnvFile(localEnvPath);
}
