// Supabase database types for CoreHub Focus
// These types match the schema defined in supabase/schema.sql
// They are provisional and will be used when migrating from mock data

export type AppOS = 'iOS' | 'Android' | 'Cross-platform'
export type AppStatus = 'Active' | 'Archived' | 'Maintenance'
export type DocumentationStatus = 'Complete' | 'Missing'
export type BuildStatus = 'Success' | 'Failed' | 'Pending'
export type BuildEnvironment = 'Production' | 'Staging' | 'Internal'
export type DocumentType = 'technical_spec' | 'graphic_spec' | 'screenshot' | 'other'

// Database table: apps
export interface DatabaseApp {
  id: string
  slug: string
  name: string
  description: string | null
  version: string | null
  icon_url: string | null
  os: AppOS
  status: AppStatus
  documentation_status: DocumentationStatus
  source_code_url: string | null
  test_url: string | null
  created_at: string
  updated_at: string
}

// Database table: app_documents
export interface DatabaseAppDocument {
  id: string
  app_id: string
  type: DocumentType
  title: string | null
  url: string | null
  storage_path: string | null
  status: string | null
  created_at: string
  updated_at: string
}

// Database table: app_builds
export interface DatabaseAppBuild {
  id: string
  app_id: string
  build_number: string | null
  version: string | null
  platform: AppOS
  status: BuildStatus
  environment: BuildEnvironment
  duration: string | null
  author: string | null
  created_at: string
}

// Database table: app_logs
export interface DatabaseAppLog {
  id: string
  app_id: string
  action: string
  author: string | null
  description: string | null
  created_at: string
}

// Joined types for API responses
export interface AppWithDocuments extends DatabaseApp {
  documents: DatabaseAppDocument[]
}

export interface AppWithBuilds extends DatabaseApp {
  builds: DatabaseAppBuild[]
}

export interface AppWithLogs extends DatabaseApp {
  logs: DatabaseAppLog[]
}

export interface AppWithAll extends DatabaseApp {
  documents: DatabaseAppDocument[]
  builds: DatabaseAppBuild[]
  logs: DatabaseAppLog[]
}
