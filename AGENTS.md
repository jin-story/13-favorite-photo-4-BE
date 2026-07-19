# Repository Guidelines

## Project Structure & Module Organization

Application code lives in `src/`. `src/app.js` configures Express and middleware, while `src/server.js` starts the server. Feature code is grouped under `src/modules/<feature>/` and follows a route-controller-service-repository split; Zod request schemas use `*.schema.js`. Shared middleware and configuration belong in `src/middlewares/` and `src/config/`. Prisma models, migrations, and seed data live in `prisma/`. Use the request samples in `http/*.http` for manual API checks. There is currently no dedicated automated test directory or static asset directory.

## Build, Test, and Development Commands

- `npm install`: install dependencies and Husky hooks.
- `npm run dev`: run the API with Nodemon for local development.
- `npm start`: start the server with `NODE_ENV=production`.
- `npm run build`: generate the Prisma client; this project has no compilation step.
- `npm run db:migrate`: create and apply a development migration.
- `npm run db:deploy`: apply committed migrations in deployment environments.
- `npm run seed`: populate the configured database with seed data.
- `npm run studio`: inspect database records with Prisma Studio.

No `npm test` script is configured. Until a test runner is added, verify affected endpoints with the matching `http/*.http` file and check Swagger UI at `/api-docs`.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, semicolons, and double quotes, matching the existing code. Name feature files `<feature>.route.js`, `<feature>.controller.js`, `<feature>.service.js`, `<feature>.repository.js`, and `<feature>.schema.js`. Keep HTTP concerns in controllers, business rules in services, and Prisma queries in repositories. Extend the centralized error handler instead of inventing endpoint-specific response formats. No formatter or linter is currently configured, so keep edits consistent and narrowly scoped.

## Testing Guidelines

When adding automated tests, mirror the module name and use `*.test.js`. Cover validation failures, authorization, expected status codes, response shapes, and repository edge cases. Never point tests at a shared or production database.

## Commit & Pull Request Guidelines

Commitlint uses Conventional Commits. Prefer messages such as `feat: add inventory filter` or `fix: handle expired refresh token`. Keep commits focused. Pull requests should explain behavior changes, link the relevant issue, list verification steps, and note schema or environment changes. Include updated Swagger annotations and `http` examples when an API contract changes.

## Security & Configuration

Copy required keys from `.env.example` into a local `.env`; never commit secrets or tokens. Review Prisma migrations before applying them and preserve authentication middleware order on protected routes.

# Project Guidelines

## Swagger / OpenAPI

- When an API endpoint is added or changed, update the Swagger documentation in the same task.
- Document endpoints based on the actual route, middleware, validation schema, and controller response.
- Do not add request or response fields that do not exist in the implementation.
- Reuse existing `securitySchemes`, components, and common error schemas.
- Apply the existing Bearer authentication scheme to protected routes and the existing cookie authentication scheme to refresh-token routes.
- Do not change business logic or middleware order during Swagger-only work.
- After making changes, generate the OpenAPI specification, validate it, and report the results.

## Approval and Change Scope

- When asked only to review, analyze, or inspect code, examine the relevant code and report findings and a proposed change plan without modifying files.
- During a review or planning stage, do not modify files until the user explicitly approves the proposed changes.
- When the user explicitly requests implementation, modification, or refactoring, treat the request as approval to perform that work.
- Modify only the requested or approved scope. Do not make unrelated changes or out-of-scope refactoring.
- If additional changes become necessary while performing approved work, report the reason and expected impact first and obtain approval before proceeding.
- If a critical security issue, a risk of data loss, or an API contract change is discovered, do not fix it automatically. Report it to the user first.
