# Orbit Database & Supabase Architectural Audit

**Document Version:** 1.0.0  
**Audit Date:** 2026-10-18  
**Target Environment:** PostgreSQL 15+ / Supabase  
**Repository:** `/home/naruto/Downloads/Orbit`

---

## 1. Executive Summary

Orbit is a Next.js (App Router, Turbopack) application built with React 19, TypeScript, Prisma ORM, and Supabase SSR (`@supabase/ssr` / `@supabase/supabase-js`).

A deep-dive audit of the repository reveals a dual-layer data architecture:
1. **Prisma Layer (`prisma/schema.prisma`):** Contains 54 PascalCase database models (`User`, `Profile`, `Opportunity`, `Project`, `Community`, `Message`, `Conversation`, `Notification`, etc.) managed through Prisma.
2. **Supabase Layer (`supabase/migrations/`):**
   - `20261018000000_enable_rls.sql`: Enables RLS on 21 PascalCase Prisma tables and defines initial access control policies.
   - `20261018000001_dot_conversations.sql`: Creates snake_case `dot_conversations` and `dot_messages` tables with per-user RLS policies.
   - `20261018000002_onboarding_profile_rls.sql`: Adds INSERT and UPDATE policies for `Profile` and `User` during onboarding.
3. **Application State & Services:**
   - Client and server components interact through Next.js server actions, API routes (`/api/...`), and Supabase Auth (`supabase.auth.getUser()`, `supabase.auth.signUp()`).
   - In-memory store (`src/lib/database/in-memory-store.ts`) provides zero-latency caching and offline resilience for development.

---

## 2. Existing Schema Analysis

### 2.1 Existing Tables (Prisma + Supabase)
| Table Name (PascalCase / SnakeCase) | Source | Primary Purpose | Primary Key |
|---|---|---|---|
| `User` / `auth.users` | Prisma / Supabase Auth | Core user credentials, roles, usernames | `id` (Text / UUID) |
| `Profile` | Prisma | User professional profiles (headline, bio, links) | `id` (cuid / text) |
| `Skill` / `ProfileSkill` | Prisma | Normalized skills taxonomy and profile associations | `id` / `(profileId, skillId)` |
| `Organization` / `OrganizationMember` | Prisma | Verified startup & enterprise workspaces | `id` / `(orgId, userId)` |
| `Opportunity` / `OpportunitySkill` | Prisma | Jobs, internships, projects | `id` |
| `OpportunityApplication` | Prisma | Candidate applications to opportunities | `id` |
| `SavedOpportunity` | Prisma | Bookmarked opportunities | `id` |
| `Project` / `ProjectSkill` / `ProjectDeliverable` | Prisma | Milestone-based paid deliverables | `id` |
| `ProjectApplication` / `ProjectReview` | Prisma | Project applications and verified reviews | `id` |
| `VerifiedWorkRecord` | Prisma | Proof-of-work cryptographic credentials | `id` |
| `Event` / `EventRegistration` | Prisma | Tech meetups, workshops, registrations | `id` |
| `HackathonTeam` / `HackathonMember` / `HackathonSubmission` | Prisma | Hackathon teams and project submissions | `id` |
| `Conversation` / `ConversationMember` | Prisma | Messaging channels and direct threads | `id` |
| `Message` | Prisma | Thread messages with attachments/metadata | `id` |
| `Notification` / `NotificationPreference` | Prisma | In-app alerts and delivery preferences | `id` |
| `Community` / `CommunityMember` | Prisma | Ecosystem groups and memberships | `id` |
| `CommunityPost` / `CommunityComment` / `SavedCommunityPost` | Prisma | Feed posts, comments, bookmarks | `id` |
| `Startup` / `StartupMember` / `StartupMilestone` / `StartupTask` | Prisma | Founder studio workspaces | `id` |
| `dot_conversations` | Supabase Migration | Persistent conversations with AI coworker Dots | `id` (Text) |
| `dot_messages` | Supabase Migration | Turn-by-turn messages between users and Dots | `id` (Text) |
| `AuditLog` | Prisma | Immutable platform trust & security events | `id` |
| `Connection` | Prisma | Professional peer-to-peer networking | `id` |
| `CollaborationRequest` / `CollaborationPost` | Prisma | Ad-hoc peer collaborations | `id` |
| `IdentityVerification` | Prisma | KYC / Student ID / National ID proofs | `id` |
| `PortableEvidenceCredential` | Prisma | SHA-256 signed portable credentials | `id` |

---

## 3. Gap Analysis: Missing Tables & Workflow Requirements

While the existing schema covers baseline models, several mission-critical Supabase tables, columns, and workflow capabilities required by the user prompt are either missing or un-migrated in pure SQL:

### 3.1 Missing System Tables
1. **`profiles` (Canonical Supabase Table):**
   - The user prompt requires a canonical `profiles` table referencing `auth.users(id)` with explicit columns: `full_name`, `username`, `avatar_url`, `headline`, `bio`, `location`, `role`, `experience_level`, `education`, `website_url`, `linkedin_url`, `github_url`, `onboarding_status`, `onboarding_completed`, `onboarding_step`, `onboarding_completed_at`.
   - *Requirement:* Must support synchronization with existing `Profile` / `User` tables to prevent breaking existing Prisma queries.
2. **`dots` (System Dots Registry):**
   - Currently, Dots are configured only in TypeScript (`src/lib/ai/groq/config.ts`).
   - *Requirement:* Canonical `dots` table with seeded system Dots: `atlas`, `scout`, `forge`, `signal` (along with `avis`, `quill`, `relay` support).
3. **`dot_tasks` (Asynchronous Task Engine):**
   - Missing table for tracking background AI tasks, research runs, match jobs, with `task_type`, `status`, `input JSONB`, `result JSONB`, `error_message`.
4. **`job_details` (Structured Job Metadata):**
   - Missing table for salary ranges, currency, employment type, and experience requirements connected to opportunities.
5. **`interests` & `user_interests`:**
   - Currently, interests are stored as text (`skillsLookingFor`). Normalized `interests` and `user_interests` join tables are missing.
6. **`user_skills` (Proficiency Mapping):**
   - `ProfileSkill` exists in Prisma, but canonical `user_skills` (with `user_id`, `skill_id`, `proficiency`) is missing.
7. **`outreach_*` (Autonomous Lead & Outreach Engine):**
   - Missing tables:
     - `outreach_leads` (lead profiles identified by Dots)
     - `outreach_drafts` (AI generated message drafts)
     - `outreach_revisions` (versioned edit iterations)
     - `outreach_approvals` (explicit human-in-the-loop review/approval status)
     - `outreach_messages` (actual outbound messages with provider IDs)
     - `outreach_events` (lifecycle audit events)
8. **`message_reads` (Message Read Receipts):**
   - Direct and group chat lacks normalized per-user read receipt tracking (`message_id`, `user_id`, `read_at`).
9. **`post_media` & `post_reactions`:**
   - Storage-backed post media table and granular reaction types (`LIKE`, `APPLAUD`, `INSIGHTFUL`, `ROCKET`) are missing in SQL.
10. **`event_attendees` & `hackathons` (Canonical Supabase Tables):**
    - Canonical `event_attendees` join table and direct `hackathons` tables with full remote, organizer, and registration fields.
11. **Full-Text Search (`tsvector` & GIN Indexes):**
    - Missing generated tsvector search columns across profiles, opportunities, projects, events, hackathons, communities, and posts.

---

## 4. Existing Relationships & Foreign Key Integrity

### Existing Core Foreign Keys:
- `Profile.userId` $\rightarrow$ `User.id` (ON DELETE CASCADE)
- `OrganizationMember.userId` $\rightarrow$ `User.id`, `OrganizationMember.organizationId` $\rightarrow$ `Organization.id`
- `OpportunityApplication.userId` $\rightarrow$ `User.id`, `OpportunityApplication.opportunityId` $\rightarrow$ `Opportunity.id`
- `ProjectDeliverable.userId` $\rightarrow$ `User.id`, `ProjectDeliverable.projectId` $\rightarrow$ `Project.id`
- `ConversationMember.userId` $\rightarrow$ `User.id`, `ConversationMember.conversationId` $\rightarrow$ `Conversation.id`
- `Message.senderId` $\rightarrow$ `User.id`, `Message.conversationId` $\rightarrow$ `Conversation.id`
- `dot_messages.conversationId` $\rightarrow$ `dot_conversations.id` (ON DELETE CASCADE)

### Required Canonical Constraints:
- `profiles.id` $\rightarrow$ `auth.users(id)` (ON DELETE CASCADE)
- `user_skills.(user_id, skill_id)` UNIQUE constraint
- `user_interests.(user_id, interest_id)` UNIQUE constraint
- `saved_opportunities.(user_id, opportunity_id)` UNIQUE constraint
- `project_members.(project_id, user_id)` UNIQUE constraint
- `event_attendees.(event_id, user_id)` UNIQUE constraint
- `community_members.(community_id, user_id)` UNIQUE constraint
- `post_reactions.(post_id, user_id, reaction_type)` UNIQUE constraint
- `conversation_participants.(conversation_id, user_id)` UNIQUE constraint
- `outreach_revisions.(draft_id, version)` UNIQUE constraint
- `user_connections.(requester_id, recipient_id)` UNIQUE constraint

---

## 5. Row Level Security (RLS) Audit

### Current Status:
- RLS is enabled on 21 PascalCase tables via `20261018000000_enable_rls.sql`.
- `dot_conversations` and `dot_messages` have RLS via `20261018000001_dot_conversations.sql`.
- `Profile` and `User` INSERT/UPDATE policies are set in `20261018000002_onboarding_profile_rls.sql`.

### Vulnerabilities / Gaps to Address:
1. **Missing Tables:** None of the new workflow tables (`outreach_*`, `dot_tasks`, `job_details`, `user_interests`, `message_reads`, `post_media`, `post_reactions`) currently have RLS enabled.
2. **Cross-Tenant Messaging Isolation:** Conversations must ensure only active participants in `conversation_participants` can select or insert messages.
3. **Outreach Privacy:** Outreach leads, drafts, revisions, and approval decisions must be strictly isolated to `auth.uid() = user_id`.
4. **Dot Task Privacy:** `dot_tasks` must be readable and writable only by the task owner (`auth.uid() = user_id`).
5. **Soft Delete Visibility:** Posts, comments, and messages with `deleted_at IS NOT NULL` should be excluded from standard user SELECT queries.

---

## 6. Migration Strategy & Non-Destructive Operations

### Safety Principles:
1. **Zero Data Loss:** All table creation will use `CREATE TABLE IF NOT EXISTS`.
2. **Zero Column Drops:** No existing columns will be removed or destructively cast.
3. **Conditional Policy Application:** All RLS policies will be dropped idempotently (`DROP POLICY IF EXISTS ...`) before creation.
4. **Prisma & Supabase Dual-Compatibility:**
   - Both `profiles` (canonical Supabase) and `"Profile"` (Prisma) will be kept in sync using database triggers, ensuring queries from both frameworks succeed without schema collision.
5. **Automatic User Onboarding Sync:**
   - A PostgreSQL trigger on `auth.users` (`on_auth_user_created`) will initialize new user rows in `profiles` and `"User"` with `onboarding_completed = false`, ensuring new signups can never bypass the onboarding workflow.

---

## 7. Extensions Required
- `pgcrypto`: For `gen_random_uuid()` and cryptographic SHA-256 verification.
- `uuid-ossp`: For standard UUID generation.
- `pg_trgm`: For fuzzy trigram search and autocomplete on skills, titles, and candidates.
