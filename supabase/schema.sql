-- ============================================================================
-- CoreHubFocus - Supabase PostgreSQL Schema
-- ============================================================================
-- Ce fichier contient le schéma complet de la base de données pour CoreHubFocus
-- Il doit être exécuté dans l'éditeur SQL de Supabase
-- Ce fichier est idempotent: il peut être relancé sans erreur
-- ============================================================================

-- ============================================================================
-- 1. TABLE: mobile_apps
-- ============================================================================
-- Stocke toutes les applications mobiles gérées dans CoreHubFocus
-- Chaque application est liée à un utilisateur via user_id
-- ============================================================================

CREATE TABLE IF NOT EXISTS mobile_apps (
  -- Identifiant unique de l'application
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Référence à l'utilisateur propriétaire (auth.users)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  version TEXT NOT NULL,
  icon_url TEXT,
  short_description TEXT,
  
  -- Plateforme et statuts
  os TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  deployment_status TEXT NOT NULL DEFAULT 'green',
  
  -- Stack technique et liens
  tech_stack TEXT[] DEFAULT '{}',
  repository_url TEXT,
  testflight_url TEXT,
  play_console_url TEXT,
  api_status_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité: slug unique par utilisateur (pas globalement)
  CONSTRAINT mobile_apps_slug_user_unique UNIQUE (user_id, slug)
);

-- ============================================================================
-- 2. TABLE: app_documents
-- ============================================================================
-- Stocke tous les documents liés aux applications (specs, screenshots, etc.)
-- Chaque document est lié à une application et un utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_documents (
  -- Identifiant unique du document
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  app_id UUID NOT NULL REFERENCES mobile_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type et métadonnées
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  
  -- URLs (fichier ou externe) - au moins une obligatoire
  file_url TEXT,
  external_url TEXT,
  storage_path TEXT,
  mime_type TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte: au moins une URL doit être présente
  CONSTRAINT app_documents_url_check CHECK (
    (file_url IS NOT NULL) OR (external_url IS NOT NULL)
  )
);

-- ============================================================================
-- 3. TABLE: app_logs
-- ============================================================================
-- Stocke les logs de modification pour chaque application
-- Permet de tracer l'historique des actions sur les applications
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_logs (
  -- Identifiant unique du log
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  app_id UUID REFERENCES mobile_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Détails de l'action
  action TEXT NOT NULL,
  details TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. TABLE: app_kpis
-- ============================================================================
-- Stocke les KPIs (Key Performance Indicators) pour chaque application
-- Permet de suivre les métriques importantes: downloads, crashes, etc.
-- ============================================================================

CREATE TABLE IF NOT EXISTS app_kpis (
  -- Identifiant unique du KPI
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Références
  app_id UUID NOT NULL REFERENCES mobile_apps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Métriques
  downloads INTEGER DEFAULT 0,
  crashes INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  last_build_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. INDEX UTILES
-- ============================================================================
-- Création d'index pour optimiser les requêtes fréquentes
-- Utilisation de IF NOT EXISTS pour permettre les réexécutions
-- ============================================================================

-- Index pour mobile_apps
CREATE INDEX IF NOT EXISTS idx_mobile_apps_user_id ON mobile_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_slug ON mobile_apps(slug);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_status ON mobile_apps(status);
CREATE INDEX IF NOT EXISTS idx_mobile_apps_os ON mobile_apps(os);

-- Index pour app_documents
CREATE INDEX IF NOT EXISTS idx_app_documents_app_id ON app_documents(app_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_user_id ON app_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_app_documents_type ON app_documents(type);

-- Index pour app_logs
CREATE INDEX IF NOT EXISTS idx_app_logs_app_id ON app_logs(app_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at DESC);

-- Index pour app_kpis
CREATE INDEX IF NOT EXISTS idx_app_kpis_app_id ON app_kpis(app_id);
CREATE INDEX IF NOT EXISTS idx_app_kpis_user_id ON app_kpis(user_id);

-- ============================================================================
-- 6. FUNCTION TRIGGER: update_updated_at_column
-- ============================================================================
-- Fonction qui met à jour automatiquement la colonne updated_at
-- lors de chaque UPDATE sur une ligne
-- Utilisation de CREATE OR REPLACE pour permettre les réexécutions
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. APPLICATION DES TRIGGERS
-- ============================================================================
-- Applique la fonction update_updated_at_column aux tables concernées
-- Utilisation de DROP TRIGGER IF EXISTS pour permettre les réexécutions
-- ============================================================================

-- Trigger pour mobile_apps
DROP TRIGGER IF EXISTS mobile_apps_updated_at ON mobile_apps;
CREATE TRIGGER mobile_apps_updated_at
  BEFORE UPDATE ON mobile_apps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour app_documents
DROP TRIGGER IF EXISTS app_documents_updated_at ON app_documents;
CREATE TRIGGER app_documents_updated_at
  BEFORE UPDATE ON app_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour app_kpis
DROP TRIGGER IF EXISTS app_kpis_updated_at ON app_kpis;
CREATE TRIGGER app_kpis_updated_at
  BEFORE UPDATE ON app_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Activation du RLS sur toutes les tables pour la sécurité
-- Le RLS garantit que chaque utilisateur ne peut accéder qu'à ses propres données
-- Note: ALTER TABLE ... ENABLE ROW LEVEL SECURITY est idempotent
-- ============================================================================

-- Activation RLS sur mobile_apps
ALTER TABLE mobile_apps ENABLE ROW LEVEL SECURITY;

-- Activation RLS sur app_documents
ALTER TABLE app_documents ENABLE ROW LEVEL SECURITY;

-- Activation RLS sur app_logs
ALTER TABLE app_logs ENABLE ROW LEVEL SECURITY;

-- Activation RLS sur app_kpis
ALTER TABLE app_kpis ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. RLS POLICIES: mobile_apps
-- ============================================================================
-- Policies pour la table mobile_apps
-- Un utilisateur ne peut voir/modifier que ses propres applications
-- Utilisation de DROP POLICY IF EXISTS pour permettre les réexécutions
-- ============================================================================

-- Policy SELECT: Un utilisateur peut lire ses propres applications
DROP POLICY IF EXISTS "Users can view their own mobile apps" ON mobile_apps;
CREATE POLICY "Users can view their own mobile apps"
  ON mobile_apps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: Un utilisateur peut créer des applications avec son propre user_id
DROP POLICY IF EXISTS "Users can insert their own mobile apps" ON mobile_apps;
CREATE POLICY "Users can insert their own mobile apps"
  ON mobile_apps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: Un utilisateur peut modifier ses propres applications
DROP POLICY IF EXISTS "Users can update their own mobile apps" ON mobile_apps;
CREATE POLICY "Users can update their own mobile apps"
  ON mobile_apps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: Un utilisateur peut supprimer ses propres applications
DROP POLICY IF EXISTS "Users can delete their own mobile apps" ON mobile_apps;
CREATE POLICY "Users can delete their own mobile apps"
  ON mobile_apps
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. RLS POLICIES: app_documents
-- ============================================================================
-- Policies pour la table app_documents
-- Un utilisateur ne peut voir/modifier que ses propres documents
-- Utilisation de DROP POLICY IF EXISTS pour permettre les réexécutions
-- ============================================================================

-- Policy SELECT: Un utilisateur peut lire ses propres documents
DROP POLICY IF EXISTS "Users can view their own app documents" ON app_documents;
CREATE POLICY "Users can view their own app documents"
  ON app_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: Un utilisateur peut créer des documents avec son propre user_id
DROP POLICY IF EXISTS "Users can insert their own app documents" ON app_documents;
CREATE POLICY "Users can insert their own app documents"
  ON app_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: Un utilisateur peut modifier ses propres documents
DROP POLICY IF EXISTS "Users can update their own app documents" ON app_documents;
CREATE POLICY "Users can update their own app documents"
  ON app_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: Un utilisateur peut supprimer ses propres documents
DROP POLICY IF EXISTS "Users can delete their own app documents" ON app_documents;
CREATE POLICY "Users can delete their own app documents"
  ON app_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 11. RLS POLICIES: app_logs
-- ============================================================================
-- Policies pour la table app_logs
-- Un utilisateur ne peut voir/ajouter que ses propres logs
-- UPDATE et DELETE ne sont pas autorisés (historique immuable)
-- Utilisation de DROP POLICY IF EXISTS pour permettre les réexécutions
-- ============================================================================

-- Policy SELECT: Un utilisateur peut lire ses propres logs
DROP POLICY IF EXISTS "Users can view their own app logs" ON app_logs;
CREATE POLICY "Users can view their own app logs"
  ON app_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: Un utilisateur peut créer des logs avec son propre user_id
DROP POLICY IF EXISTS "Users can insert their own app logs" ON app_logs;
CREATE POLICY "Users can insert their own app logs"
  ON app_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Note: UPDATE et DELETE ne sont pas autorisés sur les logs (historique immuable)

-- ============================================================================
-- 12. RLS POLICIES: app_kpis
-- ============================================================================
-- Policies pour la table app_kpis
-- Un utilisateur ne peut voir/modifier que ses propres KPIs
-- Utilisation de DROP POLICY IF EXISTS pour permettre les réexécutions
-- ============================================================================

-- Policy SELECT: Un utilisateur peut lire ses propres KPIs
DROP POLICY IF EXISTS "Users can view their own app kpis" ON app_kpis;
CREATE POLICY "Users can view their own app kpis"
  ON app_kpis
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy INSERT: Un utilisateur peut créer des KPIs avec son propre user_id
DROP POLICY IF EXISTS "Users can insert their own app kpis" ON app_kpis;
CREATE POLICY "Users can insert their own app kpis"
  ON app_kpis
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy UPDATE: Un utilisateur peut modifier ses propres KPIs
DROP POLICY IF EXISTS "Users can update their own app kpis" ON app_kpis;
CREATE POLICY "Users can update their own app kpis"
  ON app_kpis
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy DELETE: Un utilisateur peut supprimer ses propres KPIs
DROP POLICY IF EXISTS "Users can delete their own app kpis" ON app_kpis;
CREATE POLICY "Users can delete their own app kpis"
  ON app_kpis
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 13. CHECK CONSTRAINTS (ENUM-like)
-- ============================================================================
-- Ces contraintes garantissent que seules certaines valeurs sont acceptées
-- Note: Supabase n'a pas de vrai ENUM, on utilise des CHECK constraints
-- Utilisation d'un bloc DO $$ pour gérer les contraintes déjà existantes
-- ============================================================================

DO $$
BEGIN
  -- Contrainte pour mobile_apps.os: ios, android, cross_platform
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mobile_apps_os_check'
  ) THEN
    ALTER TABLE mobile_apps
      ADD CONSTRAINT mobile_apps_os_check
      CHECK (os IN ('ios', 'android', 'cross_platform'));
  END IF;

  -- Contrainte pour mobile_apps.status: active, archived
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mobile_apps_status_check'
  ) THEN
    ALTER TABLE mobile_apps
      ADD CONSTRAINT mobile_apps_status_check
      CHECK (status IN ('active', 'archived'));
  END IF;

  -- Contrainte pour mobile_apps.deployment_status: green, orange, red
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'mobile_apps_deployment_status_check'
  ) THEN
    ALTER TABLE mobile_apps
      ADD CONSTRAINT mobile_apps_deployment_status_check
      CHECK (deployment_status IN ('green', 'orange', 'red'));
  END IF;

  -- Contrainte pour app_documents.type: technical_spec, graphic_spec, screenshot, other
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'app_documents_type_check'
  ) THEN
    ALTER TABLE app_documents
      ADD CONSTRAINT app_documents_type_check
      CHECK (type IN ('technical_spec', 'graphic_spec', 'screenshot', 'other'));
  END IF;
END $$;

-- ============================================================================
-- 14. STORAGE BUCKETS INSTRUCTIONS
-- ============================================================================
-- Les buckets Storage doivent être créés manuellement dans l'interface Supabase
-- ou via l'API Supabase. Voici les instructions détaillées:
--
-- ÉTAPE 1: Créer les buckets
-- ---------------------------
-- 1. Allez dans votre projet Supabase
-- 2. Naviguez vers Storage > Buckets
-- 3. Cliquez sur "New bucket" pour créer chaque bucket:
--
--    Bucket: app-icons
--    - Name: app-icons
--    - Public: false (privé)
--    - File size limit: 5MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp
--
--    Bucket: app-documents
--    - Name: app-documents
--    - Public: false (privé)
--    - File size limit: 50MB
--    - Allowed MIME types: application/pdf, image/png, image/jpeg, text/*
--
--    Bucket: app-screenshots
--    - Name: app-screenshots
--    - Public: false (privé)
--    - File size limit: 10MB
--    - Allowed MIME types: image/png, image/jpeg, image/webp
--
-- ÉTAPE 2: Configurer les policies RLS pour chaque bucket
-- ------------------------------------------------------
-- Pour chaque bucket, créez les policies suivantes dans Storage > Policies:
--
-- Policy SELECT (lecture):
-- - Name: Users can view their own files
-- - Allowed operation: SELECT
-- - Target role: authenticated
-- - USING condition: (auth.uid()::text = (storage.foldername)[1])
--   Cette condition vérifie que le user_id correspond au premier dossier du chemin
--
-- Policy INSERT (création):
-- - Name: Users can upload their own files
-- - Allowed operation: INSERT
-- - Target role: authenticated
-- - WITH CHECK condition: (auth.uid()::text = (storage.foldername)[1])
--
-- Policy UPDATE (modification):
-- - Name: Users can update their own files
-- - Allowed operation: UPDATE
-- - Target role: authenticated
-- - USING condition: (auth.uid()::text = (storage.foldername)[1])
-- - WITH CHECK condition: (auth.uid()::text = (storage.foldername)[1])
--
-- Policy DELETE (suppression):
-- - Name: Users can delete their own files
-- - Allowed operation: DELETE
-- - Target role: authenticated
-- - USING condition: (auth.uid()::text = (storage.foldername)[1])
--
-- ÉTAPE 3: Structure recommandée des chemins de fichiers
-- ------------------------------------------------------
-- Pour garantir l'isolation par utilisateur, structurez les chemins comme suit:
--
-- Format: user_id/app_id/filename
-- Exemple: 123e4567-e89b-12d3-a456-426614174000/456e7890-e12b-34d5-a678-901234567890/icon.png
--
-- Cette structure permet:
-- - Isolation par utilisateur (premier niveau du chemin)
-- - Organisation par application (deuxième niveau)
-- - Facilité de gestion des permissions via les policies
--
-- ============================================================================
-- FIN DU SCHEMA
-- ============================================================================

