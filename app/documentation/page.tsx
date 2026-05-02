'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { KPIWidget } from '@/components/ui/KPIWidget'
import { FileText, Plus, Search, X, ExternalLink, Smartphone, Clock, Check, AlertCircle } from 'lucide-react'
import { getAppsWithDocuments, type AppWithDocuments } from '@/lib/supabase/apps-client'

type DocumentationStatus = 'Complete' | 'Missing'
type AppOS = 'iOS' | 'Android' | 'Cross-platform'

export default function DocumentationPage() {
  const router = useRouter()
  
  // Data state
  const [apps, setApps] = useState<AppWithDocuments[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState('')
  const [docFilter, setDocFilter] = useState<DocumentationStatus | 'all'>('all')
  const [osFilter, setOsFilter] = useState<AppOS | 'all'>('all')

  // Fetch apps with documents on mount
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true)
      setError('')
      
      const { data, error: fetchError } = await getAppsWithDocuments()
      
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setApps(data)
      }
      
      setLoading(false)
    }

    fetchApps()
  }, [])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalApps = apps.length
    const completeDocs = apps.filter((app) => app.documentation_status === 'Complete').length
    const missingDocs = apps.filter((app) => app.documentation_status === 'Missing').length
    const docHealth = totalApps > 0 ? Math.round((completeDocs / totalApps) * 100) : 0
    
    // Count total documents (technical + graphic specs)
    const totalDocuments = apps.reduce((count, app) => {
      return count + app.documents.length
    }, 0)

    return {
      totalDocuments,
      completeDocs,
      missingDocs,
      docHealth,
    }
  }, [apps])

  // Filter apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = app.name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Documentation filter
      if (docFilter !== 'all' && app.documentation_status !== docFilter) return false

      // OS filter
      if (osFilter !== 'all' && app.os !== osFilter) return false

      return true
    })
  }, [apps, search, docFilter, osFilter])

  const hasActiveFilters = search || docFilter !== 'all' || osFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setDocFilter('all')
    setOsFilter('all')
  }

  const getDocStatusBadge = (status: DocumentationStatus) => {
    if (status === 'Complete') {
      return <Badge variant="success">Complete</Badge>
    }
    return <Badge variant="warning">Missing</Badge>
  }

  const getLinkStatus = (url?: string | null) => {
    if (url && url.length > 0) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#0070F3] hover:underline"
        >
          <ExternalLink size={12} />
          Open
        </a>
      )
    }
    return <span className="text-xs text-[#666666]">Missing</span>
  }

  const getDocumentUrl = (app: AppWithDocuments, type: string) => {
    const doc = app.documents.find((d) => d.type === type)
    return doc?.url || ''
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/documentation" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Documentation Vault" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading documentation...</div>
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
        <Sidebar currentPath="/documentation" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Documentation Vault" />
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error loading documentation</h2>
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
      <Sidebar currentPath="/documentation" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Documentation Vault" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Documentation Vault</h1>
                <p className="text-sm text-[#888888]">Centralize technical specs, design specs and project references.</p>
              </div>
              <Button onClick={() => router.push('/apps/new')}>
                <Plus size={16} className="mr-2" />
                Nouvelle App
              </Button>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPIWidget
              label="Total Documents"
              value={kpis.totalDocuments.toString()}
              description="Technical + graphic specs"
            />
            <KPIWidget
              label="Complete Documentation"
              value={kpis.completeDocs.toString()}
              description="Apps with full docs"
            />
            <KPIWidget
              label="Missing Documentation"
              value={kpis.missingDocs.toString()}
              description="Apps needing docs"
            />
            <KPIWidget
              label="Documentation Health"
              value={kpis.docHealth.toString()}
              unit="%"
              description="Overall completion"
              trend={{ value: kpis.docHealth, isPositive: kpis.docHealth > 0 }}
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3]"
                />
              </div>
              <select
                value={docFilter}
                onChange={(e) => setDocFilter(e.target.value as DocumentationStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Documentation</option>
                <option value="Complete">Complete</option>
                <option value="Missing">Missing</option>
              </select>
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
                <FileText size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No applications yet</h2>
              <p className="text-[#888888] mb-6">Create your first mobile application to start tracking documentation.</p>
              <Button onClick={() => router.push('/apps/new')}>
                <Plus size={16} className="mr-2" />
                Nouvelle App
              </Button>
            </Card>
          )}

          {/* Empty state - filtered results */}
          {apps.length > 0 && filteredApps.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No documentation found</h2>
              <p className="text-[#888888] mb-6">Try changing your search or filters.</p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </Card>
          )}

          {/* Documentation list */}
          {filteredApps.length > 0 && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#333333]">
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Application
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Version
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        OS
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Documentation
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Technical Spec
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Design Spec
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Source Code
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Test URL
                      </th>
                      <th className="text-left text-xs font-medium text-[#888888] uppercase tracking-wider px-6 py-4">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map((app) => (
                      <tr
                        key={app.id}
                        className="border-b border-[#333333] hover:bg-[#111111]/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/apps/${app.slug}`}
                            className="flex items-center gap-3 group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center">
                              <Smartphone size={20} className="text-[#888888]" />
                            </div>
                            <div>
                              <div className="text-white font-medium group-hover:text-[#0070F3] transition-colors">
                                {app.name}
                              </div>
                              <div className="text-xs text-[#888888]">{app.description}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-white">v{app.version}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="default" className="text-xs">{app.os}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          {getDocStatusBadge(app.documentation_status)}
                        </td>
                        <td className="px-6 py-4">
                          {getLinkStatus(getDocumentUrl(app, 'technical_spec'))}
                        </td>
                        <td className="px-6 py-4">
                          {getLinkStatus(getDocumentUrl(app, 'design_spec'))}
                        </td>
                        <td className="px-6 py-4">
                          {getLinkStatus(app.source_code_url)}
                        </td>
                        <td className="px-6 py-4">
                          {getLinkStatus(app.test_url)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                            <Clock size={12} />
                            <span>{formatDate(app.updated_at)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}
