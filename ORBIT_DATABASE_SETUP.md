# Orbit Supabase Database Setup & Operations Guide

This guide details how to apply the production-grade PostgreSQL / Supabase migration for Orbit, configure necessary environment variables, verify storage buckets, configure Realtime listeners, and set up Auth.

---

## 1. Migration Command

The complete migration file is located at:
`supabase/migrations/20261018000003_orbit_complete_workflows.sql`

You can apply it via any of the following methods:

### Method A: Supabase CLI (Recommended)
If you have the Supabase CLI installed and linked to your project:
```bash
# Apply pending migrations to your remote Supabase project
npx supabase db push

# Or if developing against a local Supabase container:
npx supabase migration up
```

### Method B: PostgreSQL Client (`psql`)
Using your PostgreSQL connection string (`DATABASE_URL`):
```bash
psql "$DATABASE_URL" -f supabase/migrations/20261018000003_orbit_complete_workflows.sql
```

### Method C: Supabase Studio / Dashboard SQL Editor
1. Open your project on the [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to **SQL Editor** in the left sidebar.
3. Open or paste the full contents of `supabase/migrations/20261018000003_orbit_complete_workflows.sql`.
4. Click **Run**.
*(The script is strictly non-destructive: uses `CREATE TABLE IF NOT EXISTS`, conditional DO blocks, idempotent triggers, and safe RLS definitions).*

---

## 2. Required Environment Variables

Ensure your `.env` or `.env.local` contains the following keys:

```ini
# Supabase Public API Configuration (Client-side)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Supabase Server-side Keys (Never expose to client)
SUPABASE_SECRET_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Direct PostgreSQL Connection (Used by Prisma & Migrations)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Next.js Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 3. Required Supabase Auth Configuration

In the Supabase Dashboard under **Authentication** > **URL Configuration**:

1. **Site URL**:
   - `http://localhost:3000` (development) or `https://your-orbit-domain.com` (production)
2. **Redirect URLs**:
   - Add: `http://localhost:3000/auth/callback`
   - Add: `https://your-orbit-domain.com/auth/callback`
3. **Google OAuth Provider** (if enabled):
   - Under **Authentication** > **Providers** > **Google**:
     - Client ID: `[YOUR-GOOGLE-CLIENT-ID]`
     - Client Secret: `[YOUR-GOOGLE-CLIENT-SECRET]`
     - Authorized redirect URI in Google Cloud Console:
       `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`

---

## 4. Storage Requirements

The migration automatically creates and provisions RLS policies for 4 buckets in `storage.buckets`:

| Bucket Name | Public Access | Allowed MIME Types | Max Size | Purpose |
|---|---|---|---|---|
| `avatars` | **Public** | `image/*` | 5 MB | User and Dot profile avatars |
| `post-media` | **Public** | `image/*`, `video/mp4`, `video/quicktime` | 50 MB | Community & feed post media attachments |
| `public-assets` | **Public** | `*/*` | 20 MB | Badges, banners, project covers |
| `private-documents`| **Private** | `application/pdf`, `application/msword` | 25 MB | User resumes, applications, private docs |

### Storage RLS Policies Applied:
- **Public Read**: Anyone can read objects in `avatars`, `post-media`, and `public-assets`.
- **Authenticated Write**: Authenticated users can upload to `avatars` (scoped to their user ID folder), `post-media`, and `public-assets`.
- **Private Read/Write**: Only the file owner can read and write to `private-documents`.

---

## 5. Supabase Realtime Configuration

Orbit uses Supabase Realtime WebSocket listeners for real-time chat, notifications, and AI agent messages.

The migration automatically runs:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE dot_messages;
```

### Dashboard Verification:
1. Go to **Database** > **Replication** in the Supabase Dashboard.
2. Confirm the `supabase_realtime` publication has the following 3 tables enabled:
   - `public.messages`
   - `public.notifications`
   - `public.dot_messages`

---

## 6. TypeScript Database Types

The TypeScript types representing the complete database schema are maintained in:
`src/types/database.types.ts`

To re-generate them dynamically from a running Supabase instance in the future:
```bash
npx supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

---

## 7. Verification Checklist

After running the migration, verify that the following core flows work end-to-end:
1. **User Sign Up / Auth Trigger**:
   - Creating a user in `auth.users` automatically fires `on_auth_user_created`, creating a record in `public.profiles` with `onboarding_completed = false`.
2. **Onboarding Completion**:
   - Submitting the multi-step onboarding flow persists role, skills (`user_skills`), and interests (`user_interests`), updating `onboarding_completed = true`.
3. **System Dots**:
   - Query `SELECT id, slug, name, avatar_url FROM dots;` confirms Atlas, Scout, Forge, Signal, Avis, Quill, and Relay are present.
4. **Row Level Security**:
   - Running test queries with non-service-role keys confirms users cannot view other users' private messages, outreach drafts, dot conversations, or private documents.
