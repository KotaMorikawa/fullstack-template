export const OPENAPI_SHA256 =
	"33c3fb147b6a6821c124579cc87264393c85b82edae2e89f6cc0fd5b4dbd0565";

export const OPENAPI_DOCUMENT = `openapi: 3.0.3
info:
  title: Fullstack Template API
  version: 0.1.0
servers:
  - url: https://api-test.example.com
components:
  schemas:
    HealthResponse:
      type: object
      properties:
        status:
          type: string
          enum:
            - ok
          example: ok
      required:
        - status
  parameters: {}
paths:
  /health:
    get:
      operationId: getHealth
      summary: Health check endpoint
      responses:
        "200":
          description: API is healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
`;
