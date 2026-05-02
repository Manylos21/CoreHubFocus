# Supabase Integration for CoreHub Focus

This directory contains the Supabase client setup and types for CoreHub Focus.

## Setup Instructions

### 1. Add Supabase Environment Variables

Add your Supabase credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project dashboard under:
- Settings → API → Project URL
- Settings → API → anon / public key

### 2. Execute the Database Schema

Run the SQL schema in Supabase SQL Editor:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy the contents of `supabase/schema.sql`
4. Paste and execute the SQL

This will create the following tables:
- `apps` - Mobile applications
- `app_documents` - Documentation (specs, screenshots, etc.)
- `app_builds` - Build history
- `app_logs` - Activity logs

### 3. Configure Storage Buckets (Optional)

For file uploads, create Storage buckets in Supabase:

1. Go to Storage → Buckets
2. Create buckets for:
   - `app-icons` - Application icons
   - `app-documents` - PDFs, specs, etc.
   - `app-screenshots` - App screenshots

Configure RLS policies for each bucket to allow authenticated users to manage their own files.

## Current State

**Important:** The application currently uses mock data from `lib/mock-apps.ts`.

The Supabase integration is prepared but **not yet connected** to the UI. This is intentional to:
- Allow development and testing without a real database
- Keep the application functional during setup
- Enable gradual migration when ready

## Files

- `client.ts` - Browser-side Supabase client (for Client Components)
- `server.ts` - Server-side Supabase client with Next.js cookies (for Server Components)
- `types.ts` - TypeScript types matching the database schema

## Migration Path

When ready to migrate from mock data to Supabase:

1. Replace mock data imports with Supabase client calls
2. Update pages to use real data from the database
3. Implement authentication flow
4. Add proper error handling for database operations

## Tables

### apps
Stores mobile application data:
- id, slug, name, description, version
- icon_url, os, status, documentation_status
- source_code_url, test_url
- created_at, updated_at

### app_documents
Stores documentation and files:
- id, app_id, type, title
- url, storage_path, status
- created_at, updated_at

### app_builds
Stores build history:
- id, app_id, build_number, version
- platform, status, environment
- duration, author, created_at

### app_logs
Stores activity logs:
- id, app_id, action, author
- description, created_at

## Security

Row Level Security (RLS) is enabled on all tables with provisional policies for authenticated users. These policies can be refined later for proper multi-tenant isolation.
