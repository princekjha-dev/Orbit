-- ==============================================================================
-- ORBIT SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR ONBOARDING
-- Ensures authenticated users can insert and update their own Profile & User records
-- ==============================================================================

-- 1. Profile Table Policies
DROP POLICY IF EXISTS "Users can insert own profile" ON "Profile";
CREATE POLICY "Users can insert own profile"
  ON "Profile" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Users can update own profile" ON "Profile";
CREATE POLICY "Users can update own profile"
  ON "Profile" FOR UPDATE
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Profiles are publicly viewable" ON "Profile";
CREATE POLICY "Profiles are publicly viewable"
  ON "Profile" FOR SELECT
  USING (true);

-- 2. User Table Policies
DROP POLICY IF EXISTS "Users can insert own record" ON "User";
CREATE POLICY "Users can insert own record"
  ON "User" FOR INSERT
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can update own record" ON "User";
CREATE POLICY "Users can update own record"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

DROP POLICY IF EXISTS "Users can view public accounts" ON "User";
CREATE POLICY "Users can view public accounts"
  ON "User" FOR SELECT
  USING (NOT "isSuspended" OR auth.uid()::text = id OR is_orbit_admin());
