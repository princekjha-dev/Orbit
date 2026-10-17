-- ==============================================================================
-- ORBIT SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- Production Security Migration
-- ==============================================================================

-- Enable Row Level Security across all core tables
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "OrganizationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "OrganizationCredential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Opportunity" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "OpportunityApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Project" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProjectApplication" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ProjectDeliverable" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "VerifiedWorkRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Conversation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ConversationMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Notification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "IdentityVerification" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PortableEvidenceCredential" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TalentPool" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "TalentPoolCandidate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "ActionItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SearchAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AuditLog" ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current user is Orbit ADMIN
CREATE OR REPLACE FUNCTION is_orbit_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check organization admin/owner membership
CREATE OR REPLACE FUNCTION is_org_admin(org_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "OrganizationMember"
    WHERE "organizationId" = org_id
      AND "userId" = auth.uid()::text
      AND role IN ('OWNER', 'ADMIN')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 1. USER & PROFILE POLICIES
-- ==============================================================================

-- User: Anyone authenticated can view basic public profile info of non-suspended users
DROP POLICY IF EXISTS "Users can view public accounts" ON "User";
CREATE POLICY "Users can view public accounts"
  ON "User" FOR SELECT
  USING (NOT "isSuspended" OR auth.uid()::text = id OR is_orbit_admin());

-- User: Users can update only their own record
DROP POLICY IF EXISTS "Users can update own record" ON "User";
CREATE POLICY "Users can update own record"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id);

-- Profile: Public read
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON "Profile";
CREATE POLICY "Profiles are publicly viewable"
  ON "Profile" FOR SELECT
  USING (true);

-- Profile: Update only by owner
DROP POLICY IF EXISTS "Users can update own profile" ON "Profile";
CREATE POLICY "Users can update own profile"
  ON "Profile" FOR ALL
  USING (auth.uid()::text = "userId");

-- ==============================================================================
-- 2. OPPORTUNITY POLICIES
-- ==============================================================================

-- Opportunities: Public view of active listings
DROP POLICY IF EXISTS "Opportunities are viewable if active" ON "Opportunity";
CREATE POLICY "Opportunities are viewable if active"
  ON "Opportunity" FOR SELECT
  USING (("isActive" = true AND "isDeleted" = false) OR is_org_admin("organizationId") OR is_orbit_admin());

-- Opportunities: Management restricted to organization admins
DROP POLICY IF EXISTS "Org admins can manage opportunities" ON "Opportunity";
CREATE POLICY "Org admins can manage opportunities"
  ON "Opportunity" FOR ALL
  USING (is_org_admin("organizationId") OR is_orbit_admin());

-- Opportunity Applications: Applicant and Org Admins only
DROP POLICY IF EXISTS "Applications access control" ON "OpportunityApplication";
CREATE POLICY "Applications access control"
  ON "OpportunityApplication" FOR SELECT
  USING (
    auth.uid()::text = "userId"
    OR EXISTS (
      SELECT 1 FROM "Opportunity" o
      WHERE o.id = "opportunityId" AND is_org_admin(o."organizationId")
    )
    OR is_orbit_admin()
  );

DROP POLICY IF EXISTS "Applicants can submit application" ON "OpportunityApplication";
CREATE POLICY "Applicants can submit application"
  ON "OpportunityApplication" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- ==============================================================================
-- 3. PROJECT & DELIVERABLES POLICIES
-- ==============================================================================

-- Projects: Public view for open/in-progress projects
DROP POLICY IF EXISTS "Projects viewable by public or org" ON "Project";
CREATE POLICY "Projects viewable by public or org"
  ON "Project" FOR SELECT
  USING (("isDeleted" = false AND status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED')) OR is_org_admin("organizationId") OR is_orbit_admin());

DROP POLICY IF EXISTS "Org admins can manage projects" ON "Project";
CREATE POLICY "Org admins can manage projects"
  ON "Project" FOR ALL
  USING (is_org_admin("organizationId") OR is_orbit_admin());

-- Project Deliverables: Project contributors and org admins only
DROP POLICY IF EXISTS "Deliverables access control" ON "ProjectDeliverable";
CREATE POLICY "Deliverables access control"
  ON "ProjectDeliverable" FOR SELECT
  USING (
    auth.uid()::text = "userId"
    OR EXISTS (
      SELECT 1 FROM "Project" p
      WHERE p.id = "projectId" AND is_org_admin(p."organizationId")
    )
    OR is_orbit_admin()
  );

DROP POLICY IF EXISTS "Contributors can submit deliverables" ON "ProjectDeliverable";
CREATE POLICY "Contributors can submit deliverables"
  ON "ProjectDeliverable" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- ==============================================================================
-- 4. ORBIT CHAT & MESSAGING POLICIES (Strict Isolation)
-- ==============================================================================

-- Conversations: Only members can view conversation metadata
DROP POLICY IF EXISTS "Conversation participants access" ON "Conversation";
CREATE POLICY "Conversation participants access"
  ON "Conversation" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationMember" cm
      WHERE cm."conversationId" = id AND cm."userId" = auth.uid()::text
    )
    OR is_orbit_admin()
  );

-- Conversation Members: Only participants can view participant list
DROP POLICY IF EXISTS "Conversation members visibility" ON "ConversationMember";
CREATE POLICY "Conversation members visibility"
  ON "ConversationMember" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationMember" cm
      WHERE cm."conversationId" = "conversationId" AND cm."userId" = auth.uid()::text
    )
    OR is_orbit_admin()
  );

-- Messages: Only participants can read messages
DROP POLICY IF EXISTS "Messages readable only by conversation members" ON "Message";
CREATE POLICY "Messages readable only by conversation members"
  ON "Message" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "ConversationMember" cm
      WHERE cm."conversationId" = "conversationId" AND cm."userId" = auth.uid()::text
    )
    OR is_orbit_admin()
  );

-- Messages: Only participants can send messages with their own senderId
DROP POLICY IF EXISTS "Participants can send messages" ON "Message";
CREATE POLICY "Participants can send messages"
  ON "Message" FOR INSERT
  WITH CHECK (
    auth.uid()::text = "senderId"
    AND EXISTS (
      SELECT 1 FROM "ConversationMember" cm
      WHERE cm."conversationId" = "conversationId" AND cm."userId" = auth.uid()::text
    )
  );

-- ==============================================================================
-- 5. NOTIFICATIONS, IDENTITY & PRIVATE EVIDENCE
-- ==============================================================================

-- Notifications: Strictly user only
DROP POLICY IF EXISTS "Notifications user isolation" ON "Notification";
CREATE POLICY "Notifications user isolation"
  ON "Notification" FOR ALL
  USING (auth.uid()::text = "userId");

-- Identity Verification: User owner and Orbit Admin only
DROP POLICY IF EXISTS "Identity verification access" ON "IdentityVerification";
CREATE POLICY "Identity verification access"
  ON "IdentityVerification" FOR SELECT
  USING (auth.uid()::text = "userId" OR is_orbit_admin());

DROP POLICY IF EXISTS "Users can submit verification" ON "IdentityVerification";
CREATE POLICY "Users can submit verification"
  ON "IdentityVerification" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

DROP POLICY IF EXISTS "Only admin can approve verification" ON "IdentityVerification";
CREATE POLICY "Only admin can approve verification"
  ON "IdentityVerification" FOR UPDATE
  USING (is_orbit_admin());

-- Portable Evidence Credentials: Public read if not revoked, owner manage
DROP POLICY IF EXISTS "Public can view valid credentials" ON "PortableEvidenceCredential";
CREATE POLICY "Public can view valid credentials"
  ON "PortableEvidenceCredential" FOR SELECT
  USING ("isRevoked" = false OR auth.uid()::text = "userId" OR is_orbit_admin());

DROP POLICY IF EXISTS "Users manage own portable credentials" ON "PortableEvidenceCredential";
CREATE POLICY "Users manage own portable credentials"
  ON "PortableEvidenceCredential" FOR ALL
  USING (auth.uid()::text = "userId");

-- Talent Pools: Confidential strictly to organization admins
DROP POLICY IF EXISTS "Talent pool org isolation" ON "TalentPool";
CREATE POLICY "Talent pool org isolation"
  ON "TalentPool" FOR ALL
  USING (is_org_admin("organizationId") OR is_orbit_admin());

DROP POLICY IF EXISTS "Talent pool candidates org isolation" ON "TalentPoolCandidate";
CREATE POLICY "Talent pool candidates org isolation"
  ON "TalentPoolCandidate" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM "TalentPool" tp
      WHERE tp.id = "talentPoolId" AND is_org_admin(tp."organizationId")
    )
    OR is_orbit_admin()
  );

-- Action Items: Strictly user owner
DROP POLICY IF EXISTS "Action items user isolation" ON "ActionItem";
CREATE POLICY "Action items user isolation"
  ON "ActionItem" FOR ALL
  USING (auth.uid()::text = "userId");

-- Search Alerts: Strictly user owner
DROP POLICY IF EXISTS "Search alerts user isolation" ON "SearchAlert";
CREATE POLICY "Search alerts user isolation"
  ON "SearchAlert" FOR ALL
  USING (auth.uid()::text = "userId");

-- Audit Logs: Admin read-only, privileged insert
DROP POLICY IF EXISTS "Audit log admin access" ON "AuditLog";
CREATE POLICY "Audit log admin access"
  ON "AuditLog" FOR SELECT
  USING (is_orbit_admin());
