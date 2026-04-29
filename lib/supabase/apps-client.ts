import { createClient } from './client'
import type { 
  MobileApp, 
  AppDocument, 
  AppLog, 
  AppKPI, 
  CreateAppInput, 
  UpdateAppInput,
  OS,
  AppStatus,
  DeploymentStatus 
} from '@/types/app'

// Helper pour générer un slug à partir du nom
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Récupère toutes les applications de l'utilisateur connecté
 */
export async function getApps(filters?: {
  search?: string
  os?: OS | 'all'
  status?: AppStatus | 'all'
  deployment_status?: DeploymentStatus | 'all'
}): Promise<MobileApp[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('mobile_apps')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (filters?.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }
  
  if (filters?.os && filters.os !== 'all') {
    query = query.eq('os', filters.os)
  }
  
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.deployment_status && filters.deployment_status !== 'all') {
    query = query.eq('deployment_status', filters.deployment_status)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching apps:', error)
    throw new Error('Failed to fetch applications')
  }
  
  return data || []
}

/**
 * Récupère une application par son ID
 */
export async function getAppById(id: string): Promise<MobileApp | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('mobile_apps')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching app:', error)
    return null
  }
  
  return data
}

/**
 * Crée une nouvelle application
 */
export async function createApp(input: CreateAppInput): Promise<MobileApp> {
  const supabase = createClient()
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const slug = generateSlug(input.name)
  
  const { data, error } = await supabase
    .from('mobile_apps')
    .insert({
      user_id: user.id,
      name: input.name,
      slug,
      version: input.version,
      icon_url: input.icon_url || null,
      short_description: input.short_description || null,
      os: input.os,
      status: input.status || 'active',
      deployment_status: input.deployment_status || 'green',
      tech_stack: input.tech_stack || [],
      repository_url: input.repository_url || null,
      testflight_url: input.testflight_url || null,
      play_console_url: input.play_console_url || null,
      api_status_url: input.api_status_url || null,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating app:', error)
    throw new Error('Failed to create application')
  }
  
  // Créer les KPIs initiaux
  await createAppKPIs(data.id, user.id)
  
  // Créer un log
  await createLog(data.id, user.id, 'created', `Application "${input.name}" created`)
  
  return data
}

/**
 * Met à jour une application
 */
export async function updateApp(id: string, input: UpdateAppInput): Promise<MobileApp> {
  const supabase = createClient()
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  const updateData: any = {}
  
  if (input.name !== undefined) updateData.name = input.name
  if (input.version !== undefined) updateData.version = input.version
  if (input.icon_url !== undefined) updateData.icon_url = input.icon_url
  if (input.short_description !== undefined) updateData.short_description = input.short_description
  if (input.os !== undefined) updateData.os = input.os
  if (input.status !== undefined) updateData.status = input.status
  if (input.deployment_status !== undefined) updateData.deployment_status = input.deployment_status
  if (input.tech_stack !== undefined) updateData.tech_stack = input.tech_stack
  if (input.repository_url !== undefined) updateData.repository_url = input.repository_url
  if (input.testflight_url !== undefined) updateData.testflight_url = input.testflight_url
  if (input.play_console_url !== undefined) updateData.play_console_url = input.play_console_url
  if (input.api_status_url !== undefined) updateData.api_status_url = input.api_status_url
  
  const { data, error } = await supabase
    .from('mobile_apps')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating app:', error)
    throw new Error('Failed to update application')
  }
  
  // Créer un log
  await createLog(id, user.id, 'updated', `Application "${data.name}" updated`)
  
  return data
}

/**
 * Supprime une application
 */
export async function deleteApp(id: string, appName: string): Promise<void> {
  const supabase = createClient()
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Créer un log avant suppression
  await createLog(id, user.id, 'deleted', `Application "${appName}" deleted`)
  
  const { error } = await supabase
    .from('mobile_apps')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting app:', error)
    throw new Error('Failed to delete application')
  }
}

/**
 * Récupère les logs d'une application
 */
export async function getAppLogs(appId: string): Promise<AppLog[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_logs')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching logs:', error)
    return []
  }
  
  return data || []
}

/**
 * Récupère les KPIs d'une application
 */
export async function getAppKPIs(appId: string): Promise<AppKPI | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_kpis')
    .select('*')
    .eq('app_id', appId)
    .single()
  
  if (error) {
    console.error('Error fetching KPIs:', error)
    return null
  }
  
  return data
}

/**
 * Met à jour les KPIs d'une application
 */
export async function updateAppKPIs(
  appId: string, 
  kpis: Partial<Omit<AppKPI, 'id' | 'app_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<AppKPI> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_kpis')
    .update(kpis)
    .eq('app_id', appId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating KPIs:', error)
    throw new Error('Failed to update KPIs')
  }
  
  return data
}

/**
 * Récupère les documents d'une application
 */
export async function getAppDocuments(appId: string): Promise<AppDocument[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_documents')
    .select('*')
    .eq('app_id', appId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }
  
  return data || []
}

/**
 * Crée ou met à jour un document d'application
 */
export async function createOrUpdateAppDocument(
  appId: string,
  input: {
    type: DocumentType
    title: string
    external_url?: string
    file_url?: string
    mime_type?: string
  }
): Promise<AppDocument> {
  const supabase = createClient()
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  if (!input.title || !input.type) {
    throw new Error('Title and type are required')
  }

  if (!input.external_url && !input.file_url) {
    throw new Error('At least external_url or file_url is required')
  }

  // Vérifier si un document du même type existe déjà
  const { data: existingDoc } = await supabase
    .from('app_documents')
    .select('*')
    .eq('app_id', appId)
    .eq('type', input.type)
    .single()

  let result

  if (existingDoc) {
    // Mettre à jour le document existant
    const { data, error } = await supabase
      .from('app_documents')
      .update({
        title: input.title,
        external_url: input.external_url || null,
        file_url: input.file_url || null,
        mime_type: input.mime_type || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingDoc.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating document:', error)
      throw new Error('Failed to update document')
    }

    result = data

    // Créer un log
    await createLog(appId, user.id, 'document_updated', `Document "${input.title}" updated`)
  } else {
    // Créer un nouveau document
    const { data, error } = await supabase
      .from('app_documents')
      .insert({
        app_id: appId,
        user_id: user.id,
        type: input.type,
        title: input.title,
        external_url: input.external_url || null,
        file_url: input.file_url || null,
        mime_type: input.mime_type || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating document:', error)
      throw new Error('Failed to create document')
    }

    result = data

    // Créer un log
    await createLog(appId, user.id, 'document_added', `Document "${input.title}" added`)
  }

  return result
}

/**
 * Calcule le taux de complétude de la documentation
 */
export function getDocumentationCompleteness(documents: AppDocument[]): number {
  const hasTechnicalSpec = documents.some(d => d.type === 'technical_spec')
  const hasGraphicSpec = documents.some(d => d.type === 'graphic_spec')

  if (!hasTechnicalSpec && !hasGraphicSpec) return 0
  if (hasTechnicalSpec && hasGraphicSpec) return 100
  return 50
}

/**
 * Récupère le document principal d'un type donné
 */
export function getPrimaryDocument(documents: AppDocument[], type: DocumentType): AppDocument | null {
  return documents.find(d => d.type === type as any) || null
}

/**
 * Récupère tous les documents screenshots
 */
export function getScreenshotDocuments(documents: AppDocument[]): AppDocument[] {
  return documents.filter(d => d.type === 'screenshot')
}

// ============================================================================
// HELPER FUNCTIONS (internes)
// ============================================================================

/**
 * Crée les KPIs initiaux pour une application
 */
async function createAppKPIs(appId: string, userId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('app_kpis')
    .insert({
      app_id: appId,
      user_id: userId,
      downloads: 0,
      crashes: 0,
      active_users: 0,
    })
  
  if (error) {
    console.error('Error creating KPIs:', error)
  }
}

/**
 * Crée un log
 */
async function createLog(appId: string, userId: string, action: string, details?: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('app_logs')
    .insert({
      app_id: appId,
      user_id: userId,
      action,
      details,
    })
  
  if (error) {
    console.error('Error creating log:', error)
  }
}
