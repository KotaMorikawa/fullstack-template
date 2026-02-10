import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { stringify } from "yaml";

const run = promisify(execFile);
const apiAppModulePath = resolve("apps/api/dist/app.js");
const contractPath = resolve("packages/contracts/openapi.yaml");
const generatedRawPath = resolve(
	"packages/api-client/src/generated/openapi.raw.ts",
);

const hashPattern = /OPENAPI_SHA256\s*=\s*"([a-f0-9]+|UNGENERATED)"/;

const normalizeNewLines = (value) => value.replaceAll("\r\n", "\n").trimEnd();

try {
	await run("npm", ["run", "build", "--workspace", "api"]);
	const { createOpenApiDocument } = await import(
		`${pathToFileURL(apiAppModulePath).href}?t=${Date.now()}`
	);

	if (typeof createOpenApiDocument !== "function") {
		throw new Error(
			"createOpenApiDocument export is missing in apps/api/dist/app.js",
		);
	}

	const apiOpenapi = stringify(createOpenApiDocument());

	const [contract, generatedRaw] = await Promise.all([
		readFile(contractPath, "utf-8"),
		readFile(generatedRawPath, "utf-8"),
	]);

	if (normalizeNewLines(apiOpenapi) !== normalizeNewLines(contract)) {
		console.error(
			"Contract drift detected between apps/api OpenAPI document and packages/contracts.",
		);
		console.error("Run: npm run generate:openapi");
		process.exit(1);
	}

	const expectedHash = createHash("sha256").update(contract).digest("hex");
	const actualHash = generatedRaw.match(hashPattern)?.[1];

	if (actualHash !== expectedHash) {
		console.error("API client drift detected.");
		console.error("Run: npm run generate:api-client");
		process.exit(1);
	}

	console.log("Contract drift check passed.");
} catch (error) {
	console.error("Failed to verify contract drift.");
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
