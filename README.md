# WhistleDrop — Anonymous Reporting Backend

WhistleDrop is a privacy-focused backend API for anonymous reporting.

It allows people to submit reports without creating an account or providing their identity. Each report receives a unique case code that can be used to track the report later.

The system also provides secure moderator APIs for reviewing reports, changing report status, and adding status updates.

---

## Features

- Anonymous report submission
- No reporter account required
- Unique and non-predictable case codes
- Case tracking using the case code
- Report categories
- Optional evidence/reference URL
- Moderator authentication using JWT
- Protected moderator APIs
- Report filtering by category and status
- Report status management
- Moderator status updates
- Privacy-focused data model
- Input validation using Zod
- Password hashing using bcrypt
- Case-code hashing using SHA-256
- Security headers using Helmet
- API rate limiting
- PostgreSQL database
- Automated API tests
- TypeScript backend

---

## Report Categories

Reports can belong to one of the following categories:

- SECURITY
- HARASSMENT
- CORRUPTION
- TECHNICAL
- OTHER

---

## Report Status Workflow

Reports follow this workflow:

SUBMITTED
    |
    v
UNDER_REVIEW
   / \
  v   v
RESOLVED  DISMISSED

The initial status of every report is SUBMITTED.

After review, a moderator can move the report to UNDER_REVIEW.

From UNDER_REVIEW, the report can be RESOLVED or DISMISSED.

RESOLVED and DISMISSED are terminal states.

---

## Technology Stack

### Backend

- Node.js
- TypeScript
- Express.js

### Database

- PostgreSQL
- Prisma ORM

### Security

- Helmet
- CORS
- Express Rate Limit
- JSON Web Token (JWT)
- bcrypt
- SHA-256 hashing

### Validation

- Zod

### Testing

- Vitest
- Supertest

---

## Project Structure

whistledrop/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── scripts/
│   └── create-moderator.ts
│
├── src/
│   ├── config/
│   │   └── prisma.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── moderator.controller.ts
│   │   ├── report.controller.ts
│   │   └── tracking.controller.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── moderator.routes.ts
│   │   ├── report.routes.ts
│   │   └── tracking.routes.ts
│   ├── utils/
│   │   ├── auth.ts
│   │   └── caseCode.ts
│   ├── validators/
│   │   └── report.validator.ts
│   ├── app.ts
│   └── server.ts
│
├── tests/
│   ├── auth.test.ts
│   ├── health.test.ts
│   ├── moderator.test.ts
│   ├── report.test.ts
│   └── tracking.test.ts
│
├── .env
├── .gitignore
├── package.json
├── prisma7.config.ts
└── README.md

---

## Prerequisites

- Node.js 24+
- npm
- PostgreSQL
- VS Code or another code editor

---

## Installation

Clone the repository:

git clone <YOUR-GITHUB-REPOSITORY-URL>
cd whistledrop

Install dependencies:

npm install

---

## Environment Variables

Create a .env file in the project root.

Example:

DATABASE_URL="your-postgresql-database-url"
SHADOW_DATABASE_URL="your-shadow-database-url"
PORT=5050
JWT_SECRET="your-secret-key"

Do not commit the .env file to GitHub.

---

## Database Setup

Run:

npx prisma migrate dev

Then:

npx prisma generate

---

## Create a Moderator

For local development:

npx tsx scripts/create-moderator.ts

Production deployments should use secure production credentials.

---

## Running the API

Start the development server:

npm run dev

The API runs at:

http://localhost:5050

---

## Health Check

GET /health

Example:

curl http://localhost:5050/health

Expected response:

{
  "success": true,
  "message": "WhistleDrop API is running"
}

---

# API Documentation

## Create an Anonymous Report

### Endpoint

POST /api/reports

### Request Body

{
  "category": "TECHNICAL",
  "description": "The laboratory computer is unable to start the required software.",
  "evidenceUrl": "https://example.com/evidence"
}

### Required Fields

- category
- description

### Optional Field

- evidenceUrl

### Valid Categories

- SECURITY
- HARASSMENT
- CORRUPTION
- TECHNICAL
- OTHER

A successful submission returns a unique case code.

The reporter must save the case code because it is required to track the report later.

---

## Track a Report

### Endpoint

GET /api/tracking/:caseCode

The tracking response contains:

- Report category
- Current status
- Creation time
- Last update time
- Status updates

No reporter identity is required.

---

## Moderator Login

### Endpoint

POST /api/auth/login

### Request Body

{
  "email": "moderator@example.com",
  "password": "your-password"
}

A successful login returns a JWT token.

Protected moderator requests must include:

Authorization: Bearer <JWT>

---

# Moderator API

All moderator endpoints require authentication.

## View Reports

GET /api/moderator/reports

---

## Filter Reports

By status:

GET /api/moderator/reports?status=SUBMITTED

By category:

GET /api/moderator/reports?category=TECHNICAL

---

## Get a Specific Report

GET /api/moderator/reports/:id

---

## Update Report Status

PATCH /api/moderator/reports/:id/status

Request:

{
  "status": "UNDER_REVIEW"
}

---

## Add a Status Update

POST /api/moderator/reports/:id/updates

Request:

{
  "message": "The report is currently being reviewed."
}

---

# HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 400 | Invalid request or validation error |
| 401 | Authentication required or invalid credentials |
| 404 | Resource not found |
| 409 | Conflict |
| 500 | Internal server error |

---

# Privacy and Anonymity

WhistleDrop does not require reporters to create an account.

The report model does not store reporter information such as:

- Name
- Email
- Phone number
- Student ID
- Reporter account ID

Each report receives a randomly generated case code.

The reporter uses this case code to track the report.

---

## Case Code Security

Case codes are generated using cryptographically secure random bytes.

The original case code is returned to the reporter when the report is created.

Only a SHA-256 hash of the case code is stored in the database.

---

# Moderator Security

Moderator access is protected using JWT authentication.

Moderator passwords are stored as bcrypt hashes rather than plaintext passwords.

Unauthorized requests to moderator endpoints are rejected.

---

# Security Features

The API uses:

- Helmet security headers
- CORS
- Rate limiting
- JWT authentication
- bcrypt password hashing
- SHA-256 case-code hashing
- Cryptographically secure case-code generation
- Zod validation
- Protected moderator routes
- Environment variables for secrets

---

# Input Validation

The API validates incoming data before processing it.

Report validation includes:

- Valid category
- Minimum description length
- Maximum description length
- Valid evidence URL when provided

Moderator operations validate:

- Authentication credentials
- JWT tokens
- Report IDs
- Report statuses
- Status update messages

---

# Error Handling

The API handles invalid and unauthorized requests, including:

- Missing authentication
- Invalid JWT
- Invalid credentials
- Invalid case code
- Unknown case code
- Unknown report
- Invalid category
- Invalid status
- Missing required fields
- Invalid evidence URL

Example:

{
  "success": false,
  "message": "Authentication required"
}

---

# Testing

The project uses Vitest and Supertest for automated API testing.

Run the tests:

npm test

The test suite covers:

- Health endpoint
- Report creation
- Input validation
- Case-code tracking
- Invalid case codes
- Unknown case codes
- Moderator authentication
- Invalid credentials
- Unauthorized moderator access
- Moderator report listing
- Status updates
- Moderator messages

---

# Build

Build the project:

npm run build

Start the compiled application:

npm start

---

# Design Decisions

## Anonymous Reporting

No account is required to submit or track a report.

This avoids requiring reporters to provide personal information.

## Hashed Case Codes

The original case code is not stored directly in the database.

Only its SHA-256 hash is stored.

## Separate Moderator Authentication

Moderator functionality is separated from anonymous reporting and protected using JWT authentication.

## Status Updates

Moderators can add short updates to reports.

Reporters can view these updates through the tracking endpoint.

## API-First Architecture

The project is implemented as a backend API.

It does not require a frontend for demonstration.

The API can be tested using:

- Postman
- cURL
- Swagger/OpenAPI
- Other API clients

---

# Assumptions

1. Moderators are authorized users responsible for reviewing reports.
2. Reporters are responsible for keeping their case code safe.
3. A lost case code cannot be recovered because it is not associated with a reporter identity.
4. Evidence is currently provided through an optional reference URL.
5. File uploads are not required for the core implementation.
6. A frontend can be connected to the API in the future.
7. CORS can be restricted to a specific frontend origin in production.

---

# Demo Flow

## Step 1 — Start the server

npm run dev

## Step 2 — Check the API

curl http://localhost:5050/health

## Step 3 — Submit an anonymous report

POST /api/reports

Save the returned case code.

## Step 4 — Track the report

GET /api/tracking/:caseCode

## Step 5 — Login as moderator

POST /api/auth/login

Save the returned JWT.

## Step 6 — View reports

GET /api/moderator/reports

Use the JWT:

Authorization: Bearer <JWT>

## Step 7 — Move the report to review

PATCH /api/moderator/reports/:id/status

Request:

{
  "status": "UNDER_REVIEW"
}

## Step 8 — Add a status update

POST /api/moderator/reports/:id/updates

Request:

{
  "message": "The report is being reviewed by the moderation team."
}

## Step 9 — Resolve or dismiss

The moderator can move the report to:

RESOLVED

or:

DISMISSED

## Step 10 — Track again

The reporter can use the same case code to view the latest status and updates.

---

# Future Enhancements

Possible future improvements include:

- Moderator dashboard
- Swagger/OpenAPI documentation
- Evidence file uploads
- Advanced search
- Audit logging
- Additional privacy protections
- Automated deployment
- More comprehensive automated tests
- Notification support
- Permanent report closure

---

# Project Purpose

WhistleDrop demonstrates a privacy-focused anonymous reporting backend.

The project demonstrates:

- Anonymous report submission
- Secure case tracking
- Moderator authentication
- Protected moderation APIs
- Report filtering
- Status management
- Moderator updates
- Input validation
- Security middleware
- PostgreSQL persistence
- Automated API testing

The project was developed as a backend implementation for the GDG on Campus SRM technical recruitment task.

---

# License

This project is created for educational and recruitment purposes.