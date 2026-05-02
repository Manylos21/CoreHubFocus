'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AppCard } from '@/components/ui/AppCard'
import { Smartphone, Plus, Search, X } from 'lucide-react'
import { getApps } from '@/lib/supabase/apps-client'
import type { DatabaseApp } from '@/lib/supabase/types'

type AppOS = 'iOS' | 'Android' | 'Cross-platform'
type AppStatus = 'Active' | 'Maintenance' | 'Archived'
type DocumentationStatus = 'Complete' | 'Missing'

export default function AppsPage() {
  const router = useRouter()
  
  // Data state
  const [apps, setApps] = useState<DatabaseApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState('')
  const [osFilter, setOsFilter] = useState<AppOS | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [docFilter, setDocFilter] = useState<DocumentationStatus | 'all'>('all')

  // Fetch apps on mount
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true)
      setError('')
      
      const { data, error: fetchError } = await getApps()
      
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setApps(data)
      }
      
      setLoading(false)
    }

    fetchApps()
  }, [])

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = 
          app.name.toLowerCase().includes(searchLower) ||
          (app.description && app.description.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // OS filter
      if (osFilter !== 'all' && app.os !== osFilter) return false

      // Status filter
      if (statusFilter !== 'all' && app.status !== statusFilter) return false

      // Documentation filter
      if (docFilter !== 'all' && app.documentation_status !== docFilter) return false

      return true
    })
  }, [apps, search, osFilter, statusFilter, docFilter])

  const hasActiveFilters = search || osFilter !== 'all' || statusFilter !== 'all' || docFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setOsFilter('all')
    setStatusFilter('all')
    setDocFilter('all')
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Applications" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading applications...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Applications" />
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error loading applications</h2>
              <p className="text-[#FF0000] mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/apps" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Applications" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Applications</h1>
                <p className="text-sm text-[#888888]">Manage your mobile app portfolio, documentation and builds.</p>
              </div>
              <Button onClick={() => router.push('/apps/new')}>
                <Plus size={16} className="mr-2" />
                Nouvelle App
              </Button>
            </div>
            
            {/* Search and filters */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3]"
                />
              </div>
              <select
                value={osFilter}
                onChange={(e) => setOsFilter(e.target.value as AppOS | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All OS</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
                <option value="Cross-platform">Cross-platform</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Archived">Archived</option>
              </select>
              <select
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value as DocumentationStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Documentation</option>
                <option value="Complete">Complete</option>
                <option value="Missing">Missing</option>
              </select>
              {hasActiveFilters && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center gap-2"
                >
                  <X size={14} />
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Empty state - no apps at all */}
          {apps.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                <Smartphone size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No applications yet</h2>
              <p className="text-[#888888] mb-6">Create your first mobile application to start tracking specs, builds and documentation.</p>
              <Button onClick={() => router.push('/apps/new')}>
                <Plus size={16} className="mr-2" />
                Nouvelle App
              </Button>
            </Card>
          )}

          {/* Empty state - filtered */}
          {apps.length > 0 && filteredApps.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                <Smartphone size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No applications found</h2>
              <p className="text-[#888888] mb-6">Try changing your search or filters.</p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </Card>
          )}

          {/* Apps list */}
          {filteredApps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  name={app.name}
                  description={app.description || 'No description'}
                  version={app.version || '1.0.0'}
                  os={app.os}
                  techStack={['Not specified']}
                  status={app.status}
                  documentationStatus={app.documentation_status}
                  lastBuild="No builds yet"
                  href={`/apps/${app.slug}`}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
