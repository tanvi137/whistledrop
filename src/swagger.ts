import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.3",
  info: {
    title: "WhistleDrop API",
    version: "1.0.0",
    description:
      "Privacy-focused anonymous reporting backend with secure case tracking and moderator APIs.",
  },
  servers: [
    {
      url: "http://localhost:5050",
      description: "Local development server",
    },
  ],
  tags: [
    {
      name: "Health",
      description: "API health check",
    },
    {
      name: "Reports",
      description: "Anonymous report submission",
    },
    {
      name: "Tracking",
      description: "Anonymous case tracking",
    },
    {
      name: "Authentication",
      description: "Moderator authentication",
    },
    {
      name: "Moderator",
      description: "Protected moderator operations",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      CreateReportRequest: {
        type: "object",
        required: ["category", "description"],
        properties: {
          category: {
            type: "string",
            enum: [
              "SECURITY",
              "HARASSMENT",
              "CORRUPTION",
              "TECHNICAL",
              "OTHER",
            ],
            example: "TECHNICAL",
          },
          description: {
            type: "string",
            minLength: 10,
            maxLength: 5000,
            example:
              "The computer in the campus laboratory repeatedly crashes when opening the required software.",
          },
          evidenceUrl: {
            type: "string",
            format: "uri",
            example: "https://example.com/evidence",
          },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "moderator@whistledrop.local",
          },
          password: {
            type: "string",
            format: "password",
            example: "YourModeratorPassword",
          },
        },
      },
      StatusUpdateRequest: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "DISMISSED"],
            example: "UNDER_REVIEW",
          },
          message: {
            type: "string",
            minLength: 3,
            maxLength: 1000,
            example: "The report is now under review by the moderation team.",
          },
        },
      },
      AddUpdateRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            minLength: 3,
            maxLength: 1000,
            example: "The technical issue has been forwarded for investigation.",
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check API health",
        responses: {
          "200": {
            description: "API is running",
          },
        },
      },
    },
    "/api/reports": {
      post: {
        tags: ["Reports"],
        summary: "Submit an anonymous report",
        description:
          "Creates a report without collecting or exposing reporter identity.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateReportRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Report created successfully",
          },
          "400": {
            description: "Invalid report data",
          },
        },
      },
    },
    "/api/tracking/{caseCode}": {
      get: {
        tags: ["Tracking"],
        summary: "Track a report using its case code",
        parameters: [
          {
            name: "caseCode",
            in: "path",
            required: true,
            schema: {
              type: "string",
              minLength: 48,
              maxLength: 48,
            },
            description: "The 48-character case code returned when the report was created.",
          },
        ],
        responses: {
          "200": {
            description: "Report tracking information",
          },
          "400": {
            description: "Invalid case code format",
          },
          "404": {
            description: "Case not found",
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate a moderator",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
          },
          "401": {
            description: "Invalid credentials",
          },
        },
      },
    },
    "/api/moderator/reports": {
      get: {
        tags: ["Moderator"],
        summary: "List reports",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "DISMISSED"],
            },
          },
          {
            name: "category",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: [
                "SECURITY",
                "HARASSMENT",
                "CORRUPTION",
                "TECHNICAL",
                "OTHER",
              ],
            },
          },
        ],
        responses: {
          "200": {
            description: "Reports retrieved successfully",
          },
          "401": {
            description: "Unauthorized",
          },
        },
      },
    },
    "/api/moderator/reports/{reportId}": {
      get: {
        tags: ["Moderator"],
        summary: "Get a report by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "Report retrieved successfully",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Report not found",
          },
        },
      },
    },
    "/api/moderator/reports/{reportId}/status": {
      patch: {
        tags: ["Moderator"],
        summary: "Update report status",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/StatusUpdateRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Status updated successfully",
          },
          "400": {
            description: "Invalid status transition or request data",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Report not found",
          },
        },
      },
    },
    "/api/moderator/reports/{reportId}/updates": {
      post: {
        tags: ["Moderator"],
        summary: "Add a status update",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "reportId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AddUpdateRequest",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Status update added successfully",
          },
          "400": {
            description: "Invalid update message",
          },
          "401": {
            description: "Unauthorized",
          },
          "404": {
            description: "Report not found",
          },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerDefinition;