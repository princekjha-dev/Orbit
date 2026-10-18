-- ==============================================================================
-- ORBIT DOTS CONVERSATION & MESSAGE PERSISTENCE WITH RLS
-- Migration: 20261018000001_dot_conversations.sql
-- ==============================================================================

-- 1. Create dot_conversations table
CREATE TABLE IF NOT EXISTS "dot_conversations" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "dot_id" TEXT NOT NULL, -- 'avis' | 'scout' | 'quill' | 'relay'
  "title" TEXT NOT NULL DEFAULT 'Conversation',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create dot_messages table
CREATE TABLE IF NOT EXISTS "dot_messages" (
  "id" TEXT PRIMARY KEY,
  "conversation_id" TEXT NOT NULL REFERENCES "dot_conversations"("id") ON DELETE CASCADE,
  "user_id" TEXT NOT NULL,
  "dot_id" TEXT NOT NULL,
  "role" TEXT NOT NULL, -- 'user' | 'assistant' | 'system'
  "content" TEXT NOT NULL,
  "tool_action" TEXT,
  "tool_data" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Indexes for high-performance scoped lookups
CREATE INDEX IF NOT EXISTS "idx_dot_conversations_user_dot" ON "dot_conversations"("user_id", "dot_id");
CREATE INDEX IF NOT EXISTS "idx_dot_messages_conversation" ON "dot_messages"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "idx_dot_messages_user_dot" ON "dot_messages"("user_id", "dot_id");

-- 4. Enable Row Level Security (RLS)
ALTER TABLE IF EXISTS "dot_conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "dot_messages" ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Strict Isolation per User
-- Users can only SELECT their own conversations
DROP POLICY IF EXISTS "Users can only read own dot conversations" ON "dot_conversations";
CREATE POLICY "Users can only read own dot conversations"
  ON "dot_conversations" FOR SELECT
  USING (auth.uid()::text = "user_id");

-- Users can only INSERT conversations for themselves
DROP POLICY IF EXISTS "Users can only insert own dot conversations" ON "dot_conversations";
CREATE POLICY "Users can only insert own dot conversations"
  ON "dot_conversations" FOR INSERT
  WITH CHECK (auth.uid()::text = "user_id");

-- Users can only UPDATE their own conversations
DROP POLICY IF EXISTS "Users can only update own dot conversations" ON "dot_conversations";
CREATE POLICY "Users can only update own dot conversations"
  ON "dot_conversations" FOR UPDATE
  USING (auth.uid()::text = "user_id");

-- Users can only DELETE their own conversations
DROP POLICY IF EXISTS "Users can only delete own dot conversations" ON "dot_conversations";
CREATE POLICY "Users can only delete own dot conversations"
  ON "dot_conversations" FOR DELETE
  USING (auth.uid()::text = "user_id");

-- Messages RLS
-- Users can only read messages belonging to their conversations
DROP POLICY IF EXISTS "Users can only read own dot messages" ON "dot_messages";
CREATE POLICY "Users can only read own dot messages"
  ON "dot_messages" FOR SELECT
  USING (auth.uid()::text = "user_id");

-- Users can only insert messages for themselves
DROP POLICY IF EXISTS "Users can only insert own dot messages" ON "dot_messages";
CREATE POLICY "Users can only insert own dot messages"
  ON "dot_messages" FOR INSERT
  WITH CHECK (auth.uid()::text = "user_id");
