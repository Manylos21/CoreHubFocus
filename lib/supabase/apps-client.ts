import { createClient } from './client'
import type { DatabaseApp } from './types'

export type { DatabaseApp }

export interface CreateAppInput {
  slug: string
  name: string
  description?: string
  version?: string
  icon_url?: string
  os: 'iOS' | 'Android' | 'Cross-platform'
  status: 'Active' | 'Maintenance' | 'Archived'
  documentation_status: 'Complete' | 'Missing'
  source_code_url?: string
  test_url?: string
}

export interface CreateAppDocumentInput {
  app_id: string
  type: 'technical_spec' | 'design_spec'
  title: string
  url: string
  storage_path?: string
  status: 'Available' | 'Missing'
}

export interface AppWithDocuments extends DatabaseApp {
  documents: Array<{
    id: string
    app_id: string
    type: string
    title: string
    url: string
    storage_path: string | null
    status: string
    created_at: string
    updated_at: string
  }>
}

export interface CreateAppBuildInput {
  app_id: string
  build_number: string
  version: string
  platform: 'iOS' | 'Android' | 'Cross-platform'
  status: 'Success' | 'Failed' | 'Pending'
  environment: 'Production' | 'Staging' | 'Internal'
  duration: string
  author: string
}

export interface AppWithBuilds extends DatabaseApp {
  builds: Array<{
    id: string
    app_id: string
    build_number: string
    version: string
    platform: string
    status: string
    environment: string
    duration: string
    author: string
    created_at: string
  }>
}

/**
 * Fetches all applications from Supabase (browser client)
 * Returns sorted by created_at descending
 */
export async function getApps(): Promise<{ data: DatabaseApp[] | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching apps:', error)
    return { data: null, error: error.message }
  }
  
  return { data, error: null }
}

/**
 * Fetches a single application by slug (browser client)
 */
export async function getAppBySlug(slug: string): Promise<{ data: DatabaseApp | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    // If error is "PGRST116" (not found), return null
    if (error.code === 'PGRST116') {
      return { data: null, error: null }
    }
    console.error('Error fetching app by slug:', error)
    return { data: null, error: error.message }
  }
  
  return { data, error: null }
}

/**
 * Creates a new application in Supabase
 * Uses the new 'apps' table schema
 */
export async function createApp(input: CreateAppInput): Promise<{ data: DatabaseApp | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('apps')
    .insert({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      version: input.version || null,
      icon_url: input.icon_url || null,
      os: input.os,
      status: input.status,
      documentation_status: input.documentation_status,
      source_code_url: input.source_code_url || null,
      test_url: input.test_url || null,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating app:', error)
    return { data: null, error: error.message }
  }
  
  return { data, error: null }
}

/**
 * Checks if a slug already exists in the database
 */
export async function checkSlugExists(slug: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('apps')
    .select('slug')
    .eq('slug', slug)
    .single()
  
  if (error) {
    // If error is "PGRST116" (not found), slug doesn't exist
    if (error.code === 'PGRST116') {
      return false
    }
    console.error('Error checking slug:', error)
    return false
  }
  
  return !!data
}

/**
 * Creates a new document for an application
 */
export async function createAppDocument(input: CreateAppDocumentInput): Promise<{ data: any | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_documents')
    .insert({
      app_id: input.app_id,
      type: input.type,
      title: input.title,
      url: input.url,
      storage_path: input.storage_path || null,
      status: input.status,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating app document:', error)
    return { data: null, error: error.message }
  }
  
  return { data, error: null }
}

/**
 * Fetches all applications with their documents
 * Does two queries and groups documents by app_id on the client side
 */
export async function getAppsWithDocuments(): Promise<{ data: AppWithDocuments[] | null; error: string | null }> {
  const supabase = createClient()
  
  // Fetch apps
  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (appsError) {
    console.error('Error fetching apps:', appsError)
    return { data: null, error: appsError.message }
  }
  
  if (!apps || apps.length === 0) {
    return { data: [], error: null }
  }
  
  // Fetch all documents
  const { data: documents, error: docsError } = await supabase
    .from('app_documents')
    .select('*')
  
  if (docsError) {
    console.error('Error fetching documents:', docsError)
    return { data: null, error: docsError.message }
  }
  
  // Group documents by app_id
  const docsByAppId = new Map<string, any[]>()
  if (documents) {
    documents.forEach((doc) => {
      if (!docsByAppId.has(doc.app_id)) {
        docsByAppId.set(doc.app_id, [])
      }
      docsByAppId.get(doc.app_id)!.push(doc)
    })
  }
  
  // Attach documents to apps
  const appsWithDocuments: AppWithDocuments[] = apps.map((app) => ({
    ...app,
    documents: docsByAppId.get(app.id) || [],
  }))
  
  return { data: appsWithDocuments, error: null }
}

/**
 * Fetches documents for a specific app by its ID
 */
export async function getAppDocuments(appId: string): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_documents')
    .select('*')
    .eq('app_id', appId)
  
  if (error) {
    console.error('Error fetching app documents:', error)
    return { data: null, error: error.message }
  }
  
  return { data: data || [], error: null }
}

/**
 * Creates a new build for an application
 */
export async function createAppBuild(input: CreateAppBuildInput): Promise<{ data: any | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_builds')
    .insert({
      app_id: input.app_id,
      build_number: input.build_number,
      version: input.version,
      platform: input.platform,
      status: input.status,
      environment: input.environment,
      duration: input.duration,
      author: input.author,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating app build:', error)
    return { data: null, error: error.message }
  }
  
  return { data, error: null }
}

/**
 * Fetches all applications with their builds
 * Does two queries and groups builds by app_id on the client side
 */
export async function getAppsWithBuilds(): Promise<{ data: AppWithBuilds[] | null; error: string | null }> {
  const supabase = createClient()
  
  // Fetch apps
  const { data: apps, error: appsError } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (appsError) {
    console.error('Error fetching apps:', appsError)
    return { data: null, error: appsError.message }
  }
  
  if (!apps || apps.length === 0) {
    return { data: [], error: null }
  }
  
  // Fetch all builds
  const { data: builds, error: buildsError } = await supabase
    .from('app_builds')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (buildsError) {
    console.error('Error fetching builds:', buildsError)
    return { data: null, error: buildsError.message }
  }
  
  // Group builds by app_id
  const buildsByAppId = new Map<string, any[]>()
  if (builds) {
    builds.forEach((build) => {
      if (!buildsByAppId.has(build.app_id)) {
        buildsByAppId.set(build.app_id, [])
      }
      buildsByAppId.get(build.app_id)!.push(build)
    })
  }
  
  // Attach builds to apps
  const appsWithBuilds: AppWithBuilds[] = apps.map((app) => ({
    ...app,
    builds: buildsByAppId.get(app.id) || [],
  }))
  
  return { data: appsWithBuilds, error: null }
}

/**
 * Fetches builds for a specific app by its ID
 */
export async function getAppBuilds(appId: string): Promise<{ data: any[] | null; error: string | null }> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_builds')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching app builds:', error)
    return { data: null, error: error.message }
  }
  
  return { data: data || [], error: null }
}
