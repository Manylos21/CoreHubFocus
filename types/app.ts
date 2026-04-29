export interface App {
  id: string
  name: string
  description: string
  platform: 'ios' | 'android' | 'both'
  created_at: string
  updated_at: string
}

export interface AppVersion {
  id: string
  app_id: string
  version: string
  build_number: number
  release_notes: string
  created_at: string
}

export interface TechSpec {
  id: string
  app_id: string
  framework: string
  min_sdk: string
  dependencies: string[]
  created_at: string
  updated_at: string
}

export interface DesignSpec {
  id: string
  app_id: string
  color_palette: string[]
  typography: string
  components: string[]
  created_at: string
  updated_at: string
}

export interface TestLink {
  id: string
  app_id: string
  name: string
  url: string
  environment: 'staging' | 'production'
  created_at: string
}

export interface ChangeLog {
  id: string
  app_id: string
  version: string
  changes: string[]
  author: string
  created_at: string
}

export interface AppFile {
  id: string
  app_id: string
  name: string
  type: string
  url: string
  size: number
  created_at: string
}

export interface KPI {
  id: string
  app_id: string
  metric_name: string
  value: number
  unit: string
  date: string
}
