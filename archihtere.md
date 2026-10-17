# Orbit Architecture

## Overview

Orbit is a full-stack web application for students, founders, and organizations to discover opportunities, collaborate on projects and events, and build verifiable professional profiles. It is implemented as a Next.js App Router application with server-rendered pages, API route handlers, and a PostgreSQL database accessed through Prisma.

## Runtime and technology

- **Web application:** Next.js App Router and React
- **Language:** TypeScript
- **Authentication:** NextAuth v5 with credentials and role-aware session data
- **Data store:** PostgreSQL
- **Data access:** Prisma ORM, with a shared client in `src/lib/db.ts`
- **Validation:** Zod schemas in `src/lib/validation/schemas.ts`; forms use React Hook Form
- **Styling:** Tailwind CSS

## Main layers

```text
Browser
  ├── App Router pages and layouts (src/app)
  ├── Interactive React components (src/components)
  └── Route handlers under /api (src/app/api)
          ├── Authentication and session helpers (src/lib/auth)
          ├── Input schemas and shared utilities (src/lib)
          └── Prisma client (src/lib/db.ts)
                  └── PostgreSQL (models in prisma/schema.prisma)
```

Pages and layouts compose the user-facing routes. Client components handle interactions such as forms, dialogs, status controls, and chat threads. API route handlers perform authenticated reads and mutations, validate incoming data, and use Prisma to persist it. Shared authentication, validation, and database code lives under `src/lib`.

## Route areas

- `/` — landing page
- `/(auth)` — login and signup
- `/dashboard` — role-aware dashboard
- `/profile`, `/settings`, `/u/[username]` — private profile management and public profiles
- `/opportunities` — browse opportunities, apply, and manage applications
- `/projects` — paid project listings and applications
- `/org` — organization profiles, verification, and listing management
- `/events`, `/hackathons` — event registration and hackathon teams/submissions
- `/messages` — direct conversations
- `/admin` — moderation, verification, disputes, reports, and audit views
- `/api` — authentication, profile, organization, listing, event, team, messaging, and admin endpoints

Route groups and dynamic segments are defined by the directory structure in `src/app`.

## Data and domain

The Prisma schema in `prisma/schema.prisma` is the source of truth for persisted entities and relationships. The domain includes users and profiles, organizations and verification, opportunities and applications, paid projects, events and registrations, hackathon teams and submissions, messages, reports, disputes, and audit records. `prisma/seed.ts` supplies development/demo data.

Use the Prisma client through the shared module rather than creating independent clients. Keep database changes reflected in the Prisma schema and use the documented database scripts in `package.json` to generate, push, migrate, or inspect the schema.

## Authentication and access control

NextAuth configuration is in `src/lib/auth/config.ts`, with shared session and authorization helpers in `src/lib/auth/helpers.ts`. `src/middleware.ts` provides route-level protection. API handlers and server-rendered pages should also enforce authorization for the specific resource and action; visibility of a route in the UI is not an authorization check. Administrative operations are restricted to administrators, and organization management actions should verify the user's relationship to that organization.

## Configuration and local development

Environment configuration is documented in `.env.example`. Local setup and commands are documented in `README.md`. The application expects a PostgreSQL `DATABASE_URL` and an authentication secret. Do not commit populated environment files or credentials.

## Design constraints

- Paid project listings must not represent unpaid work.
- Organization verification is a manual review process.
- Verified work records are inspectable on public user profiles.
- Keep user-facing claims grounded in stored, verifiable data.
