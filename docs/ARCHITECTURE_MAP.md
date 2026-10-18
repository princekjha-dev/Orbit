# Orbit Architecture & Baseline Map (Stage 0)

## Executive Summary
This document provides a comprehensive technical mapping of the existing Orbit codebase prior to implementing **OrbitMod V5** ("The Four Dots": Avis, Scout, Quill, Relay). Every finding in this document was verified by inspecting the repository's files, configuration, schema, and by executing real baseline checks (`typecheck`, `test`, `build`, `lint`).

---

## 1. Runtime, Framework & Project Structure

- **Framework**: Next.js 16.4.2 (App Router, Turbopack enabled)
- **Language**: TypeScript 5.5.0 (Strict mode enabled, target ES2022)
- **UI Runtime**: React 19.0.0 & React DOM 19.0.0
- **Package Manager**: `npm` (Lockfile version 3, Node >= 20.x)
- **Folder Structure**:
  ```text
  Orbit/
  ├── docs/                      # Architectural specs, master blueprint & research
  ├── prisma/                    # Schema definition (schema.prisma) & seed.ts
  ├── public/                    # Static public assets
  ├── scripts/                   # Demo reset and seed scripts (seed-demo.ts, reset-demo.ts)
  ├── src/
  │   ├── app/                   # Next.js App Router (pages, layouts, route handlers)
  │   │   ├── (auth)/            # Login, Signup, Onboarding
  │   │   ├── admin/             # Platform administration & audit views
  │   │   ├── api/               # 32 RESTful API route groups
  │   │   ├── dashboard/         # Role-aware dashboard
  │   │   ├── communities/       # Communities / Spaces
  │   │   ├── opportunities/     # Job / Internship / Project discovery & applications
  │   │   ├── projects/          # Paid project marketplace & deliverables
  │   │   ├── messages/          # Direct messaging threads
  │   │   ├── org/               # Organization management & verification
  │   │   ├── events/            # Events & meetups
  │   │   ├── hackathons/        # Hackathon teams & submissions
  │   │   ├── evidence/          # Skill evidence & timeline
  │   │   └── u/ & profile/      # Public & private user profiles
  │   ├── components/            # Domain-driven React components
  │   │   ├── admin/, auth/, calendar/, chat/, communities/, dashboard/
  │   │   ├── events/, hackathons/, layout/, navigation/, opportunities/
  │   │   ├── profiles/, projects/, search/, settings/, ui/
  │   ├── lib/                   # Core business logic & platform infrastructure
  │   │   ├── auth/              # NextAuth config, helpers, permissions, roles
  │   │   ├── db.ts              # PrismaClient singleton
  │   │   ├── supabase/          # Supabase client, server, storage, realtime
  │   │   ├── validation/        # Zod input schemas
  │   │   └── utils.ts           # Styling utilities (cn)
  │   ├── middleware.ts          # Edge/proxy session guard
  │   └── types/                 # TypeScript declaration augmentations
  ├── .env.example               # Environment template
  ├── package.json               # Dependencies & lifecycle scripts
  ├── tsconfig.json              # TypeScript configuration
  └── vitest.config.ts           # Vitest configuration
  ```
- **Routing Pattern**:
  - Next.js App Router file-system routing.
  - Server-rendered React Server Components (RSC) for page data loaders by default.
  - Interactive leaf components marked with `"use client"`.
  - Dynamic route parameters: `[slug]`, `[id]`, `[username]`.
  - Route groups: `(auth)`.

---

## 2. API Pattern & Validation Library

- **API Architecture**: Next.js App Router Route Handlers (`src/app/api/**/route.ts`).
- **HTTP Methods**: Explicitly exported `GET`, `POST`, `PATCH`, `DELETE` handlers returning `NextResponse.json(...)`.
- **Validation**: **Zod** (`zod@^4.6.7`) is used across the codebase for request body validation and form schemas in `src/lib/validation/schemas.ts`. Form integration uses `react-hook-form@^7.90.0` with `@hookform/resolvers@^5.9.2`.
- **Error Handling Pattern**: `try/catch` with structured JSON responses:
  - `401 Unauthorized` for missing sessions.
  - `403 Forbidden` for capability violations.
  - `400 Bad Request` with Zod issues on schema validation failures.
  - `404 Not Found` for nonexistent resources.
  - `500 Internal Server Error` with server logs.

---

## 3. Database, ORM & Schema Entities

- **Database Engine**: PostgreSQL.
- **ORM & Client**: Prisma ORM (`prisma@^6.4.1`, `@prisma/client@^6.4.1`). Shared singleton client exported from `src/lib/db.ts`.
- **Migration & Sync**: `prisma db push` (development schema synchronization) and `prisma migrate dev` (versioned migrations).
- **Existing Schema Overview** (`prisma/schema.prisma`): 78 models, 19 enums.

### Key Overlapping Entities (Pre-V5 Inventory)
1. **User & Auth**:
   - `User`: Primary identity table (`id`, `email`, `username`, `name`, `role` [STUDENT, FOUNDER, ADMIN], `isSuspended`).
   - `Account`, `Session`, `VerificationToken`: NextAuth standard tables.
2. **Profile & Skills**:
   - `Profile`: 1:1 with `User` (bio, headline, college, company, portfolio, resumeUrl, avatarUrl).
   - `Skill`: Normalized skill table (`id`, `name`).
   - `ProfileSkill`, `OpportunitySkill`, `ProjectSkill`: Join tables associating skills to profiles, opportunities, and projects.
   - `Education`, `Experience`: Profile history models.
3. **Organisation & Affiliation**:
   - `Organization`: (`id`, `name`, `slug`, `website`, `verificationStatus` [UNVERIFIED, PENDING, VERIFIED, SUSPENDED]).
   - `OrganizationMember`: (`organizationId`, `userId`, `role` [OWNER, ADMIN, MEMBER], `title`).
   - `OrganizationVerification`: Document submission model (`status`, `evidenceUrl`, `reviewedBy`, `adminNotes`).
4. **Opportunities & Applications**:
   - `Opportunity`: (`id`, `organizationId`, `title`, `type` [JOB, INTERNSHIP, PAID_PROJECT, STARTUP_ROLE], `workMode`, `deadline`, `isActive`, `isVerified`).
   - `OpportunityApplication`: (`opportunityId`, `userId`, `status` [SAVED, APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, SELECTED, REJECTED, WITHDRAWN]).
5. **Projects & Workplaces**:
   - `Project`: (`id`, `organizationId`, `title`, `problem`, `scope`, `deliverable`, `acceptanceCriteria`, `status`, `health`).
   - `ProjectDeliverable`: (`projectId`, `applicationId`, `userId`, `type` [FILE, GITHUB_REPO, LIVE_DEMO, DOCUMENT, EXTERNAL_LINK], `status` [SUBMITTED, UNDER_REVIEW, REVISION_REQUESTED, ACCEPTED, REJECTED]).
   - `VerifiedWorkRecord`: Historical proof of completed project deliverables.
6. **Spaces / Community**:
   - `Community`: Slug-based community (`id`, `name`, `slug`, `description`, `rules`, `isPrivate`).
   - `CommunityMember`: Membership with roles (`MEMBER`, `MODERATOR`, `ADMIN`).
   - `CommunityPost`: (`id`, `communityId`, `authorId`, `title`, `content`, `tags`, `upvotes`).
   - `CommunityComment`: Hierarchical comments via self-referential `parentId`.
7. **Messaging**:
   - `Conversation`, `ConversationMember`: Thread containers (`isGroup`, membership).
   - `Message`: (`conversationId`, `senderId`, `type` [TEXT, ATTACHMENT, SYSTEM], `content`, `replyToId`, `isDeleted`).
8. **Trust, Moderation & Audit**:
   - `Report`: Moderation reports on users, organizations, or posts (`status` [OPEN, UNDER_REVIEW, RESOLVED, DISMISSED]).
   - `Dispute`: Project/payment dispute tracking.
   - `AuditLog`: Action tracking (`actorId`, `action`, `entityType`, `entityId`, `metadata`, `ipAddress`).
9. **Evidence & Credentials**:
   - `SkillEvidence`: Candidate proof links (`skillName`, `evidenceType` [SELF_REPORTED, VERIFIED, EXTERNAL], `credentialUrl`).
   - `PortableEvidenceCredential`: Cryptographic / portable credential representation.

---

## 4. Authentication, Session & Access Control

- **Auth Framework**: NextAuth v5 (beta 32) + Supabase Auth SSR fallback (`src/lib/auth/config.ts`, `src/lib/auth/helpers.ts`).
- **Session Strategy**: JSON Web Tokens (`jwt`).
- **Authorization Pattern**:
  - Centralized capability-based access control via `can(user, capability)` in `src/lib/auth/permissions.ts`.
  - Seven recognized Orbit roles:
    1. `TALENT` (Students & candidates)
    2. `FOUNDER` (Startup builders)
    3. `RECRUITER` (Talent acquisition)
    4. `MENTOR` (Advisors & reviewers)
    5. `ORGANIZATION_ADMIN` (Company / org leaders)
    6. `COMMUNITY_ORGANIZER` (Community managers)
    7. `PLATFORM_ADMIN` (Platform governance)
  - Helper guards: `getCurrentUser()`, `requireAuth()`, `requireCapability(capability)`, `requireAdmin()`.
  - Offline Zero-Config Demo Mode: Pre-configured demo accounts (`@orbit.demo`) with role-based mock datasets for testing without database connectivity.

---

## 5. Storage, Realtime, Queue & AI Infrastructure

- **Object Storage**: Supabase Storage (`src/lib/supabase/storage.ts`):
  - `public-assets`: For avatars, organization logos, and community images.
  - `private-documents`: For resumes, verification evidence, and deliverables. Provides time-limited signed URLs (`getPrivateDocumentSignedUrl`).
- **Realtime**: Supabase Realtime (`src/lib/supabase/realtime.ts`):
  - Postgres changes listener on `Message` (`conversationId`) and `Notification` (`userId`).
- **Queue / Background Workers**:
  - No external background worker or queue (e.g. BullMQ, Inngest, Celery) currently exists in `package.json`.
  - Asynchronous jobs are currently executed in-process or synchronously within route handlers.
- **AI Layer & Dot System**:
  - No external LLM SDK (such as `@ai-sdk/openai`, `anthropic`, or `langchain`) is installed.
  - Current "intelligence" (`src/app/api/intelligence/insights/route.ts`) is 100% deterministic rule-based analysis (deadline detection, evidence gaps, skill overlap matching).
  - The UI does not yet feature the dedicated **OrbitMod V5 Four Dots** (Avis, Scout, Quill, Relay) interface; they will be introduced as the core of OrbitMod V5.

---

## 6. Design System, Tokens, Navigation & Layout Shell

- **CSS Engine**: Tailwind CSS v4 (`@tailwindcss/postcss` + `tailwindcss@^4.3.3`) in `src/app/globals.css`.
- **Icons**: Lucide React (`lucide-react@^1.59.0`).
- **Design Tokens**: Standard neutral and brand color scales, typography defined via system fonts with modern clean aesthetics.
- **Component Primitives** (`src/components/ui`):
  - `Avatar`, `Badge`, `Button`, `Card`, `Dialog`, `EmptyState`, `Icons`, `Input`, `Select`, `Textarea`.
- **Layout Shell**:
  - `AppShell` (`src/components/layout/app-shell.tsx`): Responsive sidebar navigation (`SidebarNav`), mobile header (`MobileNav`), demo persona switcher (`DemoIndicator`).

---

## 7. Baseline Execution Results

All commands were run directly in the environment and produced the following exact results:

| Command | Status | Output / Findings |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **PASS (0 errors)** | Clean TypeScript compilation across the entire project. |
| `npm run test` (`vitest run`) | **PASS (75/75 passed)** | 6 test files passed in 396ms:<br>• `demo-auth-permissions.test.ts` (16)<br>• `critical-workflows.test.ts` (20)<br>• `supabase-auth.test.ts` (11)<br>• `v4-workflows.test.ts` (10)<br>• `organization-resolution.test.ts` (4)<br>• `supabase-security.test.ts` (14) |
| `npm run build` (`next build`) | **PASS** | Turbopack compilation succeeded in 11.6s. All 74 static and dynamic routes generated successfully. (Logs showed expected fallback handling when local PostgreSQL is offline). |
| `npm run lint` (`next lint`) | **FAIL (Exit 1)** | `Invalid project directory provided: ...\Orbit\lint`. In Next.js 16, `next lint` is no longer a CLI subcommand (treated as a directory argument) and `eslint` is not installed in `package.json`. |

---

## 8. What Could Not Be Determined / Clarifications Needed

1. **Database Connectivity**: Local PostgreSQL at `localhost:5432` is currently offline. `.env` has a remote Supabase URL (`NEXT_PUBLIC_SUPABASE_URL`), but `DATABASE_URL` is configured to `localhost:5432/orbit_dev`. Should we point `DATABASE_URL` to a local PostgreSQL instance or to the Supabase PostgreSQL transaction pooler?
2. **ESLint / Linting Strategy**: `next lint` fails because Next.js 16 deprecated/removed the legacy CLI command and no ESLint package is installed. Should we install ESLint 9 + TypeScript-ESLint for static linting or update the `lint` script to an approved alternative?
3. **Queue / Background Jobs**: OrbitMod V5 mentions async tasks (verification challenges, malware scan hooks, notification delivery). Currently no queue (e.g. BullMQ with Redis, or Inngest) is installed. Do you prefer lightweight in-process asynchronous task runners (e.g. Next.js `after` / server background tasks) or introducing a minimal queue like BullMQ / Inngest?
4. **AI Gateway Provider**: The blueprint and rules specify a centralized AI Gateway with provider adapter behind env configuration (e.g. OpenAI, Anthropic, or LiteLLM). Which LLM provider API key will be primary in your local `.env` (e.g. `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or local)?
5. **OrbitMod Navigation Slot**: Where in the main sidebar navigation should the primary "OrbitMod" entry point sit? Should it have its own dedicated top-level section (`/mod` or `/orbitmod`) leading to the 4 Dots and Spaces, or integrate directly as high-level items alongside Dashboard?
