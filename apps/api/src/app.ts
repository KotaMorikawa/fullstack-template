import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { getPool } from "./db/pool.js";

const healthOkResponseSchema = z
	.object({
		status: z.literal("ok").openapi({
			example: "ok",
		}),
		database: z.literal("ok").openapi({
			example: "ok",
		}),
	})
	.openapi("HealthOkResponse");

const healthErrorResponseSchema = z
	.object({
		status: z.literal("error").openapi({
			example: "error",
		}),
		database: z.literal("error").openapi({
			example: "error",
		}),
	})
	.openapi("HealthErrorResponse");

const healthRoute = createRoute({
	method: "get",
	path: "/health",
	operationId: "getHealth",
	summary: "Health check endpoint",
	responses: {
		200: {
			description: "API and database are healthy",
			content: {
				"application/json": {
					schema: healthOkResponseSchema,
				},
			},
		},
		503: {
			description: "Database connection failed",
			content: {
				"application/json": {
					schema: healthErrorResponseSchema,
				},
			},
		},
	},
});

const openApiDocumentConfig = {
	openapi: "3.0.3" as const,
	info: {
		title: "Fullstack Template API",
		version: "0.1.0",
	},
	servers: [
		{
			url: "https://api-test.example.com",
		},
	],
};

export const app = new OpenAPIHono();

app.get("/", (c) => c.text("Hello Hono OpenAPI!"));

app.openapi(healthRoute, async (c) => {
	try {
		await getPool().query("select 1");

		return c.json(
			{
				status: "ok",
				database: "ok",
			},
			200,
		);
	} catch {
		return c.json(
			{
				status: "error",
				database: "error",
			},
			503,
		);
	}
});

app.doc("/openapi.json", openApiDocumentConfig);
app.get(
	"/docs",
	swaggerUI({
		url: "/openapi.json",
	}),
);

export function createOpenApiDocument() {
	return app.getOpenAPIDocument(openApiDocumentConfig);
}
