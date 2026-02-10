import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { stringify } from "yaml";

const run = promisify(execFile);
const targetPath = resolve("packages/contracts/openapi.yaml");
const apiAppModulePath = resolve("apps/api/dist/app.js");

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

	const openApiDocument = createOpenApiDocument();
	const openApiYaml = stringify(openApiDocument);

	await mkdir(dirname(targetPath), { recursive: true });
	await writeFile(targetPath, openApiYaml, "utf-8");
	console.log(`OpenAPI generated: ${targetPath}`);
} catch (error) {
	console.error("Failed to generate OpenAPI contract.");
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
