# Orbit


## Core Loop

**DISCOVER → APPLY → WORK → PROVE → OUTCOME**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Auth | NextAuth v5 |
| Database | PostgreSQL + Prisma ORM |
| Styling | Tailwind CSS |
| Forms | React Hook Form + Zod |
| UI Icons | Lucide React |

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (local or hosted: [Neon](https://neon.tech), [Supabase](https://supabase.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
- Set `DATABASE_URL` to your PostgreSQL connection string
- Set `AUTH_SECRET` (generate with `openssl rand -base64 32`)

### 3. Set up the database

```bash
npm run db:push
```

### 4. Seed with test data

```bash
npm run db:seed
```

This creates:

| Account | Email | Password |
|---------|-------|----------|
| Admin | admin@orbit.app | Admin@1234 |
| Student | arjun@example.com | Student@1234 |
| Student | priya@example.com | Student@1234 |
| Founder | rohan@raftlabs.io | Founder@1234 |

Seed also creates: a verified organization, open opportunities, a paid project, events, and a hackathon team.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## V1 Features

| Feature | Status |
|---------|--------|
| Auth (signup/login with roles) | Done |
| Professional profiles + verified work records | Done |
| Organization creation + verification | Done |
| Opportunities (jobs, internships, startup roles) | Done |
| Applications with pipeline tracking | Done |
| Scoped paid project marketplace | Done |
| Events and hackathons discovery | Done |
| Hackathon team formation + submission | Done |
| Direct messaging (Orbit Chat) | Done |
| Admin panel (moderation, verifications, reports) | Done |
| Audit log | Done |
| Public user profiles at /u/[username] | Done |

---

## Database Commands

```bash
npm run db:push        # Push schema (dev)
npm run db:migrate     # Create a migration
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed test data
```

---

## Design Principles

- No unpaid work listings
- Verified organizations go through manual review
- Verified work records are publicly inspectable on user profiles
- No fake metrics, testimonials, or AI copy

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/            # Login / Signup
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── dashboard/         # Role-aware dashboard
│   ├── events/            # Events listing + detail
│   ├── hackathons/        # Teams + submission
│   ├── messages/          # Orbit Chat
│   ├── opportunities/     # Browse + detail + apply
│   ├── org/               # Org profiles + management
│   ├── profile/           # Own profile
│   ├── projects/          # Paid project marketplace
│   ├── settings/          # Profile + experience + education
│   └── u/                 # Public user profiles
├── components/
│   ├── admin/             # Moderation action components
│   ├── chat/              # Message thread
│   ├── hackathons/        # Team components
│   ├── layout/            # AppShell
│   ├── navigation/        # Sidebar + mobile nav
│   ├── opportunities/     # Opportunity forms + filters
│   ├── profiles/          # Profile edit, experience, education
│   ├── projects/          # Project forms
│   └── ui/                # Design system (Button, Card, Badge, etc.)
├── lib/
│   ├── auth/              # NextAuth config + helpers
│   ├── validation/        # Zod schemas
│   ├── db.ts              # Prisma client singleton
│   └── utils.ts           # Utilities
├── middleware.ts           # Route protection
└── types/
    └── next-auth.d.ts     # Auth type extensions
prisma/
├── schema.prisma          # Database schema (24 models)
└── seed.ts                # Test data seed
```
