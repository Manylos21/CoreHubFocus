import { createClient as createServerClient } from './server'
import type { 
  MobileApp, 
  AppDocument, 
  AppLog, 
  AppKPI,
  OS,
  AppStatus,
  DeploymentStatus 
} from '@/types/app'

/**
 * Récupère toutes les applications de l'utilisateur (server-side)
 */
export async function getAppsServer(filters?: {
  search?: string
  os?: OS | 'all'
  status?: AppStatus | 'all'
  deployment_status?: DeploymentStatus | 'all'
}): Promise<MobileApp[]> {
  const supabase = await createServerClient()
  
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
    return []
  }
  
  return data || []
}

/**
 * Récupère une application par son ID (server-side)
 */
export async function getAppByIdServer(id: string): Promise<MobileApp | null> {
  const supabase = await createServerClient()
  
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
 * Récupère les logs d'une application (server-side)
 */
export async function getAppLogsServer(appId: string): Promise<AppLog[]> {
  const supabase = await createServerClient()
  
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
 * Récupère les KPIs d'une application (server-side)
 */
export async function getAppKPIsServer(appId: string): Promise<AppKPI | null> {
  const supabase = await createServerClient()
  
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
 * Récupère les documents d'une application (server-side)
 */
export async function getAppDocumentsServer(appId: string): Promise<AppDocument[]> {
  const supabase = await createServerClient()
  
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
