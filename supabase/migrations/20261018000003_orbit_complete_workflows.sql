-- ==============================================================================
-- ORBIT PRODUCTION SUPABASE DATABASE MIGRATION
-- File: 20261018000003_orbit_complete_workflows.sql
-- Description: Complete production schema supporting all Orbit core workflows:
--   Profiles, Onboarding, Roles, Skills, Interests, Dots, Conversations,
--   Opportunities, Projects, Events, Hackathons, Communities, Posts,
--   Direct/Group Messages, Outreach Engine, Notifications, Connections, Audit,
--   Full-Text Search, Triggers, Realtime & Row Level Security (RLS).
-- ==============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. EXTENSIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. REUSABLE HELPER FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

-- Automatic updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin check helper
CREATE OR REPLACE FUNCTION is_orbit_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'PLATFORM_ADMIN')
  ) OR EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. USER PROFILES & ONBOARDING
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE,
  avatar_url TEXT,
  headline TEXT,
  bio TEXT,
  location TEXT,
  role TEXT NOT NULL DEFAULT 'talent',
  experience_level TEXT,
  education TEXT,
  company TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  onboarding_status TEXT NOT NULL DEFAULT 'not_started',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_step INTEGER NOT NULL DEFAULT 1,
  onboarding_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full-text search vector for profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE profiles ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(full_name, '') || ' ' || 
          coalesce(headline, '') || ' ' || 
          coalesce(bio, '') || ' ' || 
          coalesce(location, '') || ' ' || 
          coalesce(role, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_profiles_trgm_name ON profiles USING GIN(full_name gin_trgm_ops);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Auto-sync trigger for new Supabase Auth users -> profiles
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  extracted_username TEXT;
  extracted_name TEXT;
  extracted_role TEXT;
BEGIN
  extracted_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  extracted_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1) || '_' || substr(md5(random()::text), 1, 4)
  );

  extracted_role := COALESCE(
    NEW.raw_user_meta_data->>'orbitRole',
    NEW.raw_user_meta_data->>'role',
    'talent'
  );

  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    avatar_url,
    role,
    onboarding_status,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    extracted_name,
    extracted_username,
    NEW.raw_user_meta_data->>'avatar_url',
    lower(extracted_role),
    'not_started',
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. SKILLS & USER SKILLS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);
CREATE INDEX IF NOT EXISTS idx_skills_slug ON skills(slug);

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency TEXT DEFAULT 'intermediate', -- 'beginner' | 'intermediate' | 'advanced' | 'expert'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. INTERESTS & USER INTERESTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interests_name ON interests(name);

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, interest_id)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SYSTEM DOTS REGISTRY & TASK ENGINE
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed System Dots (ATLAS, SCOUT, FORGE, SIGNAL + AVIS, QUILL, RELAY)
INSERT INTO dots (slug, name, role, description, avatar_url, is_active)
VALUES
  ('atlas', 'Atlas', 'Research & Knowledge', 'Factual intelligence and ecosystem knowledge engine.', '/dots/blue.png', true),
  ('scout', 'Scout', 'Career & Opportunity', 'Deterministic 5-signal opportunity matching and pod allocation.', '/dots/purple.png', true),
  ('forge', 'Forge', 'Founder & Venture', 'Startup venture execution, scoped milestones, and team builder.', '/dots/orange.png', true),
  ('signal', 'Signal', 'Talent & Recruiting', 'Evidence-scored candidate discovery and pipeline management.', '/dots/mint.png', true),
  ('avis', 'Avis', 'Trust & Verification', 'DNS TXT verification and proof-of-work attestation.', '/dots/blue.png', true),
  ('quill', 'Quill', 'Skills & Evidence', 'Proof-of-work assessment rubrics and verifiable hashing.', '/dots/mint.png', true),
  ('relay', 'Relay', 'Safe Messaging & Collaboration', 'Deterministic risk-mitigated communication and routing.', '/dots/orange.png', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  description = EXCLUDED.description,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = NOW();

-- Dot Tasks table
CREATE TABLE IF NOT EXISTS dot_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dot_id TEXT NOT NULL,
  conversation_id TEXT,
  task_type TEXT NOT NULL, -- 'match_role' | 'verify_claim' | 'draft_outreach' | 'generate_rubric'
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dot_tasks_user_status ON dot_tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_dot_tasks_dot ON dot_tasks(dot_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. OPPORTUNITIES, JOBS & APPLICATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'job', -- 'job' | 'internship' | 'project' | 'mentorship' | 'startup' | 'collaboration' | 'freelance'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  location TEXT DEFAULT 'Remote',
  remote BOOLEAN NOT NULL DEFAULT true,
  application_url TEXT,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active', -- 'draft' | 'active' | 'closed' | 'archived'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'opportunities' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE opportunities ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(title, '') || ' ' || 
          coalesce(description, '') || ' ' || 
          coalesce(organization_name, '') || ' ' || 
          coalesce(location, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_search ON opportunities USING GIN(search_vector);

DROP TRIGGER IF EXISTS set_opportunities_updated_at ON opportunities;
CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Structured Job Details
CREATE TABLE IF NOT EXISTS job_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  employment_type TEXT DEFAULT 'full_time', -- 'full_time' | 'part_time' | 'contract' | 'internship'
  salary_min NUMERIC,
  salary_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  experience_level TEXT,
  company_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_details_opportunity ON job_details(opportunity_id);

-- Saved Opportunities
CREATE TABLE IF NOT EXISTS saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_opportunities_user ON saved_opportunities(user_id);

-- Opportunity Applications
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'applied', -- 'saved' | 'applied' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
  cover_note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, opportunity_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON applications(opportunity_id);

DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. PROJECTS, MEMBERS & DELIVERABLES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'idea' | 'planning' | 'building' | 'active' | 'completed' | 'archived'
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public' | 'private'
  cover_image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE projects ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(title, '') || ' ' || 
          coalesce(description, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(search_vector);

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Project Members
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'lead' | 'member' | 'contributor'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);

-- Project Skills
CREATE TABLE IF NOT EXISTS project_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, skill_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. EVENTS & ATTENDEES
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  venue TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  registration_url TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE events ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(title, '') || ' ' || 
          coalesce(description, '') || ' ' || 
          coalesce(city, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_search ON events USING GIN(search_vector);

DROP TRIGGER IF EXISTS set_events_updated_at ON events;
CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Event Attendees
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered', -- 'interested' | 'registered' | 'attended' | 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. HACKATHONS, TEAMS & PARTICIPANTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  organizer TEXT NOT NULL,
  location TEXT DEFAULT 'Online',
  remote BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  registration_url TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming' | 'active' | 'judging' | 'completed' | 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hackathons' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE hackathons ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(title, '') || ' ' || 
          coalesce(description, '') || ' ' || 
          coalesce(organizer, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hackathons_starts_at ON hackathons(starts_at);
CREATE INDEX IF NOT EXISTS idx_hackathons_search ON hackathons USING GIN(search_vector);

-- Hackathon Teams
CREATE TABLE IF NOT EXISTS hackathon_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hackathon Team Members
CREATE TABLE IF NOT EXISTS hackathon_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES hackathon_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Hackathon Participants
CREATE TABLE IF NOT EXISTS hackathon_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID NOT NULL REFERENCES hackathons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES hackathon_teams(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(hackathon_id, user_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. COMMUNITIES, POSTS, COMMENTS, MEDIA & REACTIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  image_url TEXT,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public' | 'private'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'communities' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE communities ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (
        to_tsvector('english', 
          coalesce(name, '') || ' ' || 
          coalesce(description, '')
        )
      ) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_search ON communities USING GIN(search_vector);

-- Community Members
CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'member' | 'moderator' | 'admin'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public', -- 'public' | 'community' | 'private'
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE posts ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_community ON posts(community_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search ON posts USING GIN(search_vector);

DROP TRIGGER IF EXISTS set_posts_updated_at ON posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Post Media
CREATE TABLE IF NOT EXISTS post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image', -- 'image' | 'video' | 'document'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_media_post ON post_media(post_id);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);

DROP TRIGGER IF EXISTS set_comments_updated_at ON comments;
CREATE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Post Reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like', -- 'like' | 'applaud' | 'insightful' | 'rocket'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. DIRECT & GROUP MESSAGING WITH READ RECEIPTS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'direct', -- 'direct' | 'group' | 'dot'
  name TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);

DROP TRIGGER IF EXISTS set_conversations_updated_at ON conversations;
CREATE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Conversation Participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON conversation_participants(conversation_id);

-- Helper: Check conversation participant access
CREATE OR REPLACE FUNCTION is_conversation_participant(conv_id UUID, u_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = conv_id AND user_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text' | 'attachment' | 'system'
  metadata JSONB DEFAULT '{}'::jsonb,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

DROP TRIGGER IF EXISTS set_messages_updated_at ON messages;
CREATE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Message Read Receipts
CREATE TABLE IF NOT EXISTS message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. OUTREACH ENGINE (LEADS, DRAFTS, REVISIONS, APPROVALS, MESSAGES)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS outreach_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  organization TEXT,
  email TEXT,
  profile_url TEXT,
  source TEXT,
  source_url TEXT,
  relevance_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_leads_user ON outreach_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_leads_dot ON outreach_leads(dot_id);

-- Outreach Drafts
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dot_id TEXT NOT NULL,
  lead_id UUID REFERENCES outreach_leads(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'email', -- 'email' | 'dm' | 'other'
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'sent'
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_drafts_user_status ON outreach_drafts(user_id, status);

DROP TRIGGER IF EXISTS set_outreach_drafts_updated_at ON outreach_drafts;
CREATE TRIGGER set_outreach_drafts_updated_at
  BEFORE UPDATE ON outreach_drafts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- Outreach Revisions
CREATE TABLE IF NOT EXISTS outreach_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES outreach_drafts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  instruction TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(draft_id, version)
);

CREATE INDEX IF NOT EXISTS idx_outreach_revisions_draft ON outreach_revisions(draft_id);

-- Outreach Approvals (Strict Human-In-The-Loop confirmation)
CREATE TABLE IF NOT EXISTS outreach_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES outreach_drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'skipped'
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_approvals_draft ON outreach_approvals(draft_id);

-- Outreach Messages (Dispatched messages with provider tracking)
CREATE TABLE IF NOT EXISTS outreach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES outreach_drafts(id) ON DELETE SET NULL,
  recipient TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued' | 'sending' | 'sent' | 'failed'
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_messages_status ON outreach_messages(status);

-- Outreach Events Audit
CREATE TABLE IF NOT EXISTS outreach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outreach_message_id UUID NOT NULL REFERENCES outreach_messages(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'drafted' | 'edited' | 'approved' | 'send_attempted' | 'sent' | 'failed' | 'skipped'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_outreach_events_msg ON outreach_events(outreach_message_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. NOTIFICATIONS, USER CONNECTIONS & AUDIT LOGS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'message' | 'opportunity' | 'application' | 'connection' | 'dot_task' | 'system'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;

-- User Connections (Networking)
CREATE TABLE IF NOT EXISTS user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'blocked'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_user_connections_req ON user_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_rec ON user_connections(recipient_id);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS across all new and canonical tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE dots ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. Skills & Interests (Public read, authenticated insert)
DROP POLICY IF EXISTS "Skills are readable by everyone" ON skills;
CREATE POLICY "Skills are readable by everyone"
  ON skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create skills" ON skills;
CREATE POLICY "Authenticated users can create skills"
  ON skills FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "User skills viewable by everyone" ON user_skills;
CREATE POLICY "User skills viewable by everyone"
  ON user_skills FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own skills" ON user_skills;
CREATE POLICY "Users can manage own skills"
  ON user_skills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Interests viewable by everyone" ON interests;
CREATE POLICY "Interests viewable by everyone"
  ON interests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own interests" ON user_interests;
CREATE POLICY "Users can manage own interests"
  ON user_interests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. System Dots & Dot Conversations
DROP POLICY IF EXISTS "Dots are viewable by everyone" ON dots;
CREATE POLICY "Dots are viewable by everyone"
  ON dots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own dot conversations" ON dot_conversations;
CREATE POLICY "Users can manage own dot conversations"
  ON dot_conversations FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can manage own dot messages" ON dot_messages;
CREATE POLICY "Users can manage own dot messages"
  ON dot_messages FOR ALL USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can manage own dot tasks" ON dot_tasks;
CREATE POLICY "Users can manage own dot tasks"
  ON dot_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Opportunities, Jobs & Applications
DROP POLICY IF EXISTS "Opportunities viewable by everyone" ON opportunities;
CREATE POLICY "Opportunities viewable by everyone"
  ON opportunities FOR SELECT USING (status = 'active' OR auth.uid() = created_by OR is_orbit_admin());

DROP POLICY IF EXISTS "Creators can manage opportunities" ON opportunities;
CREATE POLICY "Creators can manage opportunities"
  ON opportunities FOR ALL USING (auth.uid() = created_by OR is_orbit_admin()) WITH CHECK (auth.uid() = created_by OR is_orbit_admin());

DROP POLICY IF EXISTS "Job details viewable with opportunity" ON job_details;
CREATE POLICY "Job details viewable with opportunity"
  ON job_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "Creators can manage job details" ON job_details;
CREATE POLICY "Creators can manage job details"
  ON job_details FOR ALL USING (
    EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND (o.created_by = auth.uid() OR is_orbit_admin()))
  );

DROP POLICY IF EXISTS "Users can manage own saved opportunities" ON saved_opportunities;
CREATE POLICY "Users can manage own saved opportunities"
  ON saved_opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Applicants and creators can view applications" ON applications;
CREATE POLICY "Applicants and creators can view applications"
  ON applications FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM opportunities o WHERE o.id = opportunity_id AND o.created_by = auth.uid()) OR
    is_orbit_admin()
  );

DROP POLICY IF EXISTS "Applicants can submit application" ON applications;
CREATE POLICY "Applicants can submit application"
  ON applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Applicants can withdraw application" ON applications;
CREATE POLICY "Applicants can withdraw application"
  ON applications FOR UPDATE USING (auth.uid() = user_id);

-- 5. Projects
DROP POLICY IF EXISTS "Projects viewable by public or members" ON projects;
CREATE POLICY "Projects viewable by public or members"
  ON projects FOR SELECT USING (
    visibility = 'public' OR 
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = id AND pm.user_id = auth.uid()) OR
    is_orbit_admin()
  );

DROP POLICY IF EXISTS "Owners can manage projects" ON projects;
CREATE POLICY "Owners can manage projects"
  ON projects FOR ALL USING (auth.uid() = owner_id OR is_orbit_admin()) WITH CHECK (auth.uid() = owner_id OR is_orbit_admin());

DROP POLICY IF EXISTS "Project members viewable by public" ON project_members;
CREATE POLICY "Project members viewable by public"
  ON project_members FOR SELECT USING (true);

-- 6. Events & Hackathons
DROP POLICY IF EXISTS "Events viewable by everyone" ON events;
CREATE POLICY "Events viewable by everyone"
  ON events FOR SELECT USING (status != 'draft' OR auth.uid() = created_by OR is_orbit_admin());

DROP POLICY IF EXISTS "Creators can manage events" ON events;
CREATE POLICY "Creators can manage events"
  ON events FOR ALL USING (auth.uid() = created_by OR is_orbit_admin());

DROP POLICY IF EXISTS "Users can manage own event registrations" ON event_attendees;
CREATE POLICY "Users can manage own event registrations"
  ON event_attendees FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Hackathons viewable by everyone" ON hackathons;
CREATE POLICY "Hackathons viewable by everyone"
  ON hackathons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own hackathon registration" ON hackathon_participants;
CREATE POLICY "Users can manage own hackathon registration"
  ON hackathon_participants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Communities, Posts & Comments
DROP POLICY IF EXISTS "Communities viewable by everyone" ON communities;
CREATE POLICY "Communities viewable by everyone"
  ON communities FOR SELECT USING (visibility = 'public' OR auth.uid() = created_by OR is_orbit_admin());

DROP POLICY IF EXISTS "Posts viewable by permission" ON posts;
CREATE POLICY "Posts viewable by permission"
  ON posts FOR SELECT USING (
    deleted_at IS NULL AND (
      visibility = 'public' OR 
      author_id = auth.uid() OR 
      (community_id IS NOT NULL AND EXISTS (SELECT 1 FROM community_members cm WHERE cm.community_id = posts.community_id AND cm.user_id = auth.uid()))
    )
  );

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Authors can edit or delete own posts" ON posts;
CREATE POLICY "Authors can edit or delete own posts"
  ON posts FOR UPDATE USING (auth.uid() = author_id OR is_orbit_admin());

DROP POLICY IF EXISTS "Comments viewable on active posts" ON comments;
CREATE POLICY "Comments viewable on active posts"
  ON comments FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can manage own post reactions" ON post_reactions;
CREATE POLICY "Users can manage own post reactions"
  ON post_reactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Messaging (Direct & Group)
DROP POLICY IF EXISTS "Participants can view conversations" ON conversations;
CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT USING (is_conversation_participant(id, auth.uid()) OR is_orbit_admin());

DROP POLICY IF EXISTS "Participants can view conversation members" ON conversation_participants;
CREATE POLICY "Participants can view conversation members"
  ON conversation_participants FOR SELECT USING (is_conversation_participant(conversation_id, auth.uid()));

DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT USING (is_conversation_participant(conversation_id, auth.uid()) OR is_orbit_admin());

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND is_conversation_participant(conversation_id, auth.uid())
  );

DROP POLICY IF EXISTS "Users can manage own message reads" ON message_reads;
CREATE POLICY "Users can manage own message reads"
  ON message_reads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Outreach (Strict Single-Tenant Isolation)
DROP POLICY IF EXISTS "Users can only view own outreach leads" ON outreach_leads;
CREATE POLICY "Users can only view own outreach leads"
  ON outreach_leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only view own outreach drafts" ON outreach_drafts;
CREATE POLICY "Users can only view own outreach drafts"
  ON outreach_drafts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only view own outreach revisions" ON outreach_revisions;
CREATE POLICY "Users can only view own outreach revisions"
  ON outreach_revisions FOR ALL USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can only view own outreach approvals" ON outreach_approvals;
CREATE POLICY "Users can only view own outreach approvals"
  ON outreach_approvals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only view own outreach messages" ON outreach_messages;
CREATE POLICY "Users can only view own outreach messages"
  ON outreach_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM outreach_drafts od WHERE od.id = draft_id AND od.user_id = auth.uid()) OR is_orbit_admin()
  );

-- 10. Notifications & Connections
DROP POLICY IF EXISTS "Users can only view own notifications" ON notifications;
CREATE POLICY "Users can only view own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own connections" ON user_connections;
CREATE POLICY "Users can view own connections"
  ON user_connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can create connection requests" ON user_connections;
CREATE POLICY "Users can create connection requests"
  ON user_connections FOR INSERT WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Recipients can respond to connections" ON user_connections;
CREATE POLICY "Recipients can respond to connections"
  ON user_connections FOR UPDATE USING (auth.uid() = recipient_id);

-- 11. Audit Logs (Append-only by server/user, readable by admin or owner)
DROP POLICY IF EXISTS "Users can view own audit logs" ON audit_logs;
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT USING (auth.uid() = user_id OR is_orbit_admin());

DROP POLICY IF EXISTS "Authenticated users can append audit logs" ON audit_logs;
CREATE POLICY "Authenticated users can append audit logs"
  ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. STORAGE BUCKETS & POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('public-assets', 'public-assets', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('private-documents', 'private-documents', false, 26214400, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']),
  ('post-media', 'post-media', true, 20971520, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies
DROP POLICY IF EXISTS "Public Assets are viewable by anyone" ON storage.objects;
CREATE POLICY "Public Assets are viewable by anyone"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('public-assets', 'avatars', 'post-media'));

DROP POLICY IF EXISTS "Authenticated users can upload to public assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload to public assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id IN ('public-assets', 'avatars', 'post-media')
  );

DROP POLICY IF EXISTS "Users can upload private documents" ON storage.objects;
CREATE POLICY "Users can upload private documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'private-documents'
  );

DROP POLICY IF EXISTS "Users can access own private documents" ON storage.objects;
CREATE POLICY "Users can access own private documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'private-documents' AND
    (auth.uid()::text = (storage.foldername(name))[1] OR is_orbit_admin())
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. SUPABASE REALTIME CONFIGURATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Add realtime publication for live messaging, notifications, and dot interactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'dot_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE dot_messages;
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- If supabase_realtime publication is not created yet (e.g. local standard postgres), create it
    CREATE PUBLICATION supabase_realtime FOR TABLE messages, notifications, dot_messages;
END $$;
