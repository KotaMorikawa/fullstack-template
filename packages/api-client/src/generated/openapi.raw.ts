export const OPENAPI_SHA256 =
	"356395c27069282621e31e6d86713fcb63fe898f73476437ba1338dd934c8102";

export const OPENAPI_DOCUMENT = `openapi: 3.0.3
info:
  title: Fullstack Template API
  version: 0.1.0
servers:
  - url: https://api-test.example.com
components:
  schemas:
    HealthOkResponse:
      type: object
      properties:
        status:
          type: string
          enum:
            - ok
          example: ok
        database:
          type: string
          enum:
            - ok
          example: ok
      required:
        - status
        - database
    HealthErrorResponse:
      type: object
      properties:
        status:
          type: string
          enum:
            - error
          example: error
        database:
          type: string
          enum:
            - error
          example: error
      required:
        - status
        - database
  parameters: {}
paths:
  /health:
    get:
      operationId: getHealth
      summary: Health check endpoint
      responses:
        "200":
          description: API and database are healthy
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthOkResponse"
        "503":
          description: Database connection failed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthErrorResponse"
`;
