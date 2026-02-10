import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const healthResponseSchema = z
	.object({
		status: z.literal("ok").openapi({
			example: "ok",
		}),
	})
	.openapi("HealthResponse");

const healthRoute = createRoute({
	method: "get",
	path: "/health",
	operationId: "getHealth",
	summary: "Health check endpoint",
	responses: {
		200: {
			description: "API is healthy",
			content: {
				"application/json": {
					schema: healthResponseSchema,
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

app.openapi(healthRoute, (c) => {
	return c.json(
		{
			status: "ok",
		},
		200,
	);
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
