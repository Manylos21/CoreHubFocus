-- ============================================================================
-- CoreHub Focus - Supabase PostgreSQL Schema
-- ============================================================================
-- This file contains the database schema for CoreHub Focus
-- Execute this in the Supabase SQL Editor
-- This schema is idempotent: it can be re-run without errors
-- ============================================================================

-- ============================================================================
-- 1. TABLE: apps
-- ============================================================================
-- Stores all mobile applications managed in CoreHub Focus
-- ============================================================================

CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  icon_url TEXT,
  os TEXT NOT NULL,
  status TEXT NOT NULL,
  documentation_status TEXT NOT NULL,
  source_code_url TEXT,
  test_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. TABLE: app_documents
-- ============================================================================
-- Stores all documents linked to applications (specs, screenshots, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT,
  url TEXT,
  storage_path TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TABLE: app_builds
-- ============================================================================
-- Stores build history for each application
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  build_number TEXT,
  version TEXT,
  platform TEXT NOT NULL,
  status TEXT NOT NULL,
  environment TEXT NOT NULL,
  duration TEXT,
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE: app_logs
-- ============================================================================
-- Stores modification logs for each application
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  author TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. USEFUL INDEXES
-- ============================================================================
-- Create indexes for frequently queried columns
-- ============================================================================

-- Indexes for apps
CREATE INDEX IF NOT EXISTS idx_apps_slug ON apps(slug);
CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);
CREATE INDEX IF NOT EXISTS idx_apps_created_at ON apps(created_at DESC);

-- Indexes for app_documents
CREATE INDEX IF NOT EXISTS idx_app_documents_app_id ON app_documents(app_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_type ON app_documents(type);

-- Indexes for app_builds
CREATE INDEX IF NOT EXISTS idx_app_builds_app_id ON app_builds(app_id);
CREATE INDEX IF NOT EXISTS idx_app_builds_created_at ON app_builds(created_at DESC);

-- Indexes for app_logs
CREATE INDEX IF NOT EXISTS idx_app_logs_app_id ON app_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);

-- ============================================================================
-- 6. FUNCTION TRIGGER: update_updated_at_column
-- ============================================================================
-- Function to automatically update updated_at column on UPDATE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. APPLY TRIGGERS
-- ============================================================================
-- Apply the update_updated_at_column function to relevant tables
-- ============================================================================

-- Trigger for apps
DROP TRIGGER IF EXISTS apps_updated_at ON apps;
CREATE TRIGGER apps_updated_at
  BEFORE UPDATE ON apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for app_documents
DROP TRIGGER IF EXISTS app_documents_updated_at ON app_documents;
CREATE TRIGGER app_documents_updated_at
  BEFORE UPDATE ON app_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables for security
-- Policies are provisional for authenticated users only
-- ============================================================================

-- Enable RLS on apps
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

-- Enable RLS on app_documents
ALTER TABLE app_documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on app_builds
ALTER TABLE app_builds ENABLE ROW LEVEL SECURITY;

-- Enable RLS on app_logs
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS POLICIES: apps
-- ============================================================================
-- Provisional policies for authenticated users
-- ============================================================================

-- Policy SELECT: Authenticated users can read all apps
DROP POLICY IF EXISTS "Authenticated users can view apps" ON apps;
CREATE POLICY "Authenticated users can view apps"
  ON apps
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy INSERT: Authenticated users can insert apps
DROP POLICY IF EXISTS "Authenticated users can insert apps" ON apps;
CREATE POLICY "Authenticated users can insert apps"
  ON apps
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy UPDATE: Authenticated users can update apps
DROP POLICY IF EXISTS "Authenticated users can update apps" ON apps;
CREATE POLICY "Authenticated users can update apps"
  ON apps
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy DELETE: Authenticated users can delete apps
DROP POLICY IF EXISTS "Authenticated users can delete apps" ON apps;
CREATE POLICY "Authenticated users can delete apps"
  ON apps
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 10. RLS POLICIES: app_documents
-- ============================================================================
-- Provisional policies for authenticated users
-- ============================================================================

-- Policy SELECT: Authenticated users can read all documents
DROP POLICY IF EXISTS "Authenticated users can view app documents" ON app_documents;
CREATE POLICY "Authenticated users can view app documents"
  ON app_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy INSERT: Authenticated users can insert documents
DROP POLICY IF EXISTS "Authenticated users can insert app documents" ON app_documents;
CREATE POLICY "Authenticated users can insert app documents"
  ON app_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy UPDATE: Authenticated users can update documents
DROP POLICY IF EXISTS "Authenticated users can update app documents" ON app_documents;
CREATE POLICY "Authenticated users can update app documents"
  ON app_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy DELETE: Authenticated users can delete documents
DROP POLICY IF EXISTS "Authenticated users can delete app documents" ON app_documents;
CREATE POLICY "Authenticated users can delete app documents"
  ON app_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- 11. RLS POLICIES: app_builds
-- ============================================================================
-- Provisional policies for authenticated users
-- ============================================================================

-- Policy SELECT: Authenticated users can read all builds
DROP POLICY IF EXISTS "Authenticated users can view app builds" ON app_builds;
CREATE POLICY "Authenticated users can view app builds"
  ON app_builds
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy INSERT: Authenticated users can insert builds
DROP POLICY IF EXISTS "Authenticated users can insert app builds" ON app_builds;
CREATE POLICY "Authenticated users can insert app builds"
  ON app_builds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- 12. RLS POLICIES: app_logs
-- ============================================================================
-- Provisional policies for authenticated users
-- UPDATE and DELETE are not allowed (immutable history)
-- ============================================================================

-- Policy SELECT: Authenticated users can read all logs
DROP POLICY IF EXISTS "Authenticated users can view app logs" ON app_logs;
CREATE POLICY "Authenticated users can view app logs"
  ON app_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy INSERT: Authenticated users can insert logs
DROP POLICY IF EXISTS "Authenticated users can insert app logs" ON app_logs;
CREATE POLICY "Authenticated users can insert app logs"
  ON app_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: UPDATE and DELETE are not allowed on logs (immutable history)

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
