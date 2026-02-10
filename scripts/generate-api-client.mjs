import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const contractPath = resolve("packages/contracts/openapi.yaml");
const generatedDir = resolve("packages/api-client/src/generated");
const rawOutputPath = resolve(`${generatedDir}/openapi.raw.ts`);
const endpointOutputPath = resolve(`${generatedDir}/endpoints.ts`);

const endpointPattern = /^\s{2}(\/[-A-Za-z0-9_{}./]*):\s*$/gm;

const toTemplateLiteral = (input) =>
	input.replace(/`/g, "\\`").replace(/\\/g, "\\\\");

try {
	const openapi = await readFile(contractPath, "utf-8");
	const sha = createHash("sha256").update(openapi).digest("hex");

	const endpoints = new Set();
	for (const match of openapi.matchAll(endpointPattern)) {
		if (match[1]) {
			endpoints.add(match[1]);
		}
	}

	const endpointList = [...endpoints].sort();
	const endpointType =
		endpointList.length === 0
			? '"/health"'
			: endpointList.map((endpoint) => `"${endpoint}"`).join(" | ");

	const rawTs = [
		"export const OPENAPI_SHA256 =",
		`\t"${sha}";`,
		"",
		`export const OPENAPI_DOCUMENT = \`${toTemplateLiteral(openapi)}\`;`,
		"",
	].join("\n");
	const endpointsTs = `export type GeneratedEndpoint = ${endpointType};\n`;

	await mkdir(generatedDir, { recursive: true });
	await writeFile(rawOutputPath, rawTs, "utf-8");
	await writeFile(endpointOutputPath, endpointsTs, "utf-8");

	console.log(`API client generated from ${contractPath}`);
	console.log(`- hash: ${sha}`);
	console.log(`- endpoints: ${endpointList.join(", ") || "/health"}`);
} catch (error) {
	console.error("Failed to generate API client from OpenAPI.");
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
