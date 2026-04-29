// Types correspondant au schéma Supabase

export type OS = 'ios' | 'android' | 'cross_platform'
export type AppStatus = 'active' | 'archived'
export type DeploymentStatus = 'green' | 'orange' | 'red'
export type DocumentType = 'technical_spec' | 'graphic_spec' | 'screenshot' | 'other'

export interface MobileApp {
  id: string
  user_id: string
  name: string
  slug: string
  version: string
  icon_url: string | null
  short_description: string | null
  os: OS
  status: AppStatus
  deployment_status: DeploymentStatus
  tech_stack: string[]
  repository_url: string | null
  testflight_url: string | null
  play_console_url: string | null
  api_status_url: string | null
  created_at: string
  updated_at: string
}

export interface AppDocument {
  id: string
  app_id: string
  user_id: string
  type: DocumentType
  title: string
  file_url: string | null
  external_url: string | null
  storage_path: string | null
  mime_type: string | null
  created_at: string
  updated_at: string
}

export interface AppLog {
  id: string
  app_id: string | null
  user_id: string
  action: string
  details: string | null
  created_at: string
}

export interface AppKPI {
  id: string
  app_id: string
  user_id: string
  downloads: number
  crashes: number
  active_users: number
  last_build_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateAppInput {
  name: string
  version: string
  icon_url?: string
  short_description?: string
  os: OS
  status?: AppStatus
  deployment_status?: DeploymentStatus
  tech_stack?: string[]
  repository_url?: string
  testflight_url?: string
  play_console_url?: string
  api_status_url?: string
}

export interface UpdateAppInput {
  name?: string
  version?: string
  icon_url?: string
  short_description?: string
  os?: OS
  status?: AppStatus
  deployment_status?: DeploymentStatus
  tech_stack?: string[]
  repository_url?: string
  testflight_url?: string
  play_console_url?: string
  api_status_url?: string
}
