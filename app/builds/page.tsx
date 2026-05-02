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
import { Rocket, Plus, Search, X, Smartphone, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getAppsWithBuilds, createAppBuild, getApps, type AppWithBuilds, type CreateAppBuildInput, type DatabaseApp } from '@/lib/supabase/apps-client'

type BuildStatus = 'Success' | 'Failed' | 'Pending'
type BuildEnvironment = 'Production' | 'Staging' | 'Internal'
type AppOS = 'iOS' | 'Android' | 'Cross-platform'

export default function BuildsPage() {
  const router = useRouter()
  
  // Data state
  const [appsWithBuilds, setAppsWithBuilds] = useState<AppWithBuilds[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Register build form state
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    app_id: '',
    build_number: '',
    version: '',
    platform: 'iOS' as AppOS,
    status: 'Success' as BuildStatus,
    environment: 'Production' as BuildEnvironment,
    duration: '',
    author: '',
  })
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildStatus | 'all'>('all')
  const [platformFilter, setPlatformFilter] = useState<AppOS | 'all'>('all')
  const [environmentFilter, setEnvironmentFilter] = useState<BuildEnvironment | 'all'>('all')

  // Fetch apps with builds on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError('')
      
      const { data, error: fetchError } = await getAppsWithBuilds()
      
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setAppsWithBuilds(data)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [])

  // Flatten all builds from all apps
  const allBuilds = useMemo(() => {
    const builds: Array<{
      build: any
      app: DatabaseApp
    }> = []
    
    appsWithBuilds.forEach((app) => {
      app.builds.forEach((build) => {
        builds.push({ build, app })
      })
    })
    
    // Sort by created_at descending
    return builds.sort((a, b) => 
      new Date(b.build.created_at).getTime() - new Date(a.build.created_at).getTime()
    )
  }, [appsWithBuilds])

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalBuilds = allBuilds.length
    const successfulBuilds = allBuilds.filter((b) => b.build.status === 'Success').length
    const failedBuilds = allBuilds.filter((b) => b.build.status === 'Failed').length
    
    // Get last deployment (most recent successful production build)
    const lastDeployment = allBuilds.find((b) => 
      b.build.status === 'Success' && b.build.environment === 'Production'
    )
    
    return {
      totalBuilds,
      successfulBuilds,
      failedBuilds,
      lastDeployment: lastDeployment 
        ? `${lastDeployment.app.name} v${lastDeployment.build.version}`
        : 'No deployment yet',
    }
  }, [allBuilds])

  // Filter builds
  const filteredBuilds = useMemo(() => {
    return allBuilds.filter(({ build, app }) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch = 
          app.name.toLowerCase().includes(searchLower) ||
          build.version.toLowerCase().includes(searchLower) ||
          build.build_number.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all' && build.status !== statusFilter) return false

      // Platform filter
      if (platformFilter !== 'all' && build.platform !== platformFilter) return false

      // Environment filter
      if (environmentFilter !== 'all' && build.environment !== environmentFilter) return false

      return true
    })
  }, [search, statusFilter, platformFilter, environmentFilter])

  const hasActiveFilters = search || statusFilter !== 'all' || platformFilter !== 'all' || environmentFilter !== 'all'

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPlatformFilter('all')
    setEnvironmentFilter('all')
  }

  const getStatusBadge = (status: BuildStatus) => {
    switch (status) {
      case 'Success':
        return (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-[#00CC88]" />
            <span className="text-sm text-[#00CC88]">Success</span>
          </div>
        )
      case 'Failed':
        return (
          <div className="flex items-center gap-1.5">
            <XCircle size={14} className="text-[#FF0000]" />
            <span className="text-sm text-[#FF0000]">Failed</span>
          </div>
        )
      case 'Pending':
        return (
          <div className="flex items-center gap-1.5">
            <AlertCircle size={14} className="text-[#F5A623]" />
            <span className="text-sm text-[#F5A623]">Pending</span>
          </div>
        )
    }
  }

  const getEnvironmentBadge = (environment: BuildEnvironment) => {
    switch (environment) {
      case 'Production':
        return <Badge variant="default">Production</Badge>
      case 'Staging':
        return <Badge variant="success">Staging</Badge>
      case 'Internal':
        return <Badge variant="warning">Internal</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleRegisterBuild = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterLoading(true)

    if (!registerForm.app_id || !registerForm.build_number || !registerForm.version || !registerForm.duration || !registerForm.author) {
      setRegisterError('All fields are required')
      setRegisterLoading(false)
      return
    }

    const input: CreateAppBuildInput = {
      app_id: registerForm.app_id,
      build_number: registerForm.build_number,
      version: registerForm.version,
      platform: registerForm.platform,
      status: registerForm.status,
      environment: registerForm.environment,
      duration: registerForm.duration,
      author: registerForm.author,
    }

    const { error: createError } = await createAppBuild(input)

    if (createError) {
      setRegisterError(createError)
      setRegisterLoading(false)
      return
    }

    setRegisterSuccess(true)
    setRegisterLoading(false)
    
    // Refresh builds list
    const { data } = await getAppsWithBuilds()
    if (data) {
      setAppsWithBuilds(data)
    }

    // Reset form and close after delay
    setTimeout(() => {
      setRegisterSuccess(false)
      setShowRegisterForm(false)
      setRegisterForm({
        app_id: '',
        build_number: '',
        version: '',
        platform: 'iOS',
        status: 'Success',
        environment: 'Production',
        duration: '',
        author: '',
      })
    }, 1500)
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/builds" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Builds" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading builds...</div>
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
        <Sidebar currentPath="/builds" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Builds" />
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error loading builds</h2>
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
      <Sidebar currentPath="/builds" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Builds" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Builds</h1>
                <p className="text-sm text-[#888888]">Track versions, deployment status and release activity.</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setShowRegisterForm(true)}>
                  <Plus size={16} className="mr-2" />
                  Register Build
                </Button>
                <Button onClick={() => router.push('/apps/new')}>
                  <Plus size={16} className="mr-2" />
                  Nouvelle App
                </Button>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPIWidget
              label="Total Builds"
              value={kpis.totalBuilds.toString()}
              description="All builds across apps"
            />
            <KPIWidget
              label="Successful Builds"
              value={kpis.successfulBuilds.toString()}
              description="Builds completed successfully"
            />
            <KPIWidget
              label="Failed Builds"
              value={kpis.failedBuilds.toString()}
              description="Builds that failed"
            />
            <KPIWidget
              label="Last Deployment"
              value={kpis.lastDeployment}
              description="Most recent production release"
            />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                <input
                  type="text"
                  placeholder="Search by app, version or build number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BuildStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value as AppOS | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Platforms</option>
                <option value="iOS">iOS</option>
                <option value="Android">Android</option>
                <option value="Cross-platform">Cross-platform</option>
              </select>
              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value as BuildEnvironment | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Environments</option>
                <option value="Production">Production</option>
                <option value="Staging">Staging</option>
                <option value="Internal">Internal</option>
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

          {/* Empty state - no builds at all */}
          {allBuilds.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                <Rocket size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No builds yet</h2>
              <p className="text-[#888888] mb-6">Build history will appear here once deployments are registered.</p>
              <Button onClick={() => setShowRegisterForm(true)}>
                <Plus size={16} className="mr-2" />
                Register Build
              </Button>
            </Card>
          )}

          {/* Empty state - filtered results */}
          {allBuilds.length > 0 && filteredBuilds.length === 0 && (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                <Rocket size={32} className="text-[#888888]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No builds found</h2>
              <p className="text-[#888888] mb-6">Try changing your search or filters.</p>
              {hasActiveFilters && (
                <Button variant="secondary" onClick={resetFilters}>
                  Reset filters
                </Button>
              )}
            </Card>
          )}

          {/* Builds timeline */}
          {filteredBuilds.length > 0 && (
            <div className="space-y-4">
              {filteredBuilds.map(({ build, app }) => (
                <Card
                  key={build.id}
                  className="p-5 hover:border-[#0070F3] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* App icon and info */}
                      <Link
                        href={`/apps/${app.slug}`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#222222] flex items-center justify-center">
                          <Smartphone size={24} className="text-[#888888]" />
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover:text-[#0070F3] transition-colors">
                            {app.name}
                          </div>
                          <div className="text-sm text-[#888888]">
                            Build #{build.build_number} • v{build.version}
                          </div>
                        </div>
                      </Link>

                      {/* Build details */}
                      <div className="flex items-center gap-4">
                        {getStatusBadge(build.status)}
                        {getEnvironmentBadge(build.environment)}
                        <Badge variant="default" className="text-xs">{build.platform}</Badge>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 text-sm text-[#888888]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{formatDate(build.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        <span>{build.author}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Rocket size={14} />
                        <span>{build.duration}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Register Build Form Modal */}
          {showRegisterForm && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Register Build</h2>
                  <Button variant="secondary" size="sm" onClick={() => setShowRegisterForm(false)}>
                    <X size={16} />
                  </Button>
                </div>

                {registerSuccess ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-[#00CC88] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Build Registered!</h3>
                    <p className="text-[#888888]">The build has been successfully registered.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterBuild} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Application</label>
                      <select
                        value={registerForm.app_id}
                        onChange={(e) => setRegisterForm({ ...registerForm, app_id: e.target.value })}
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                        required
                      >
                        <option value="">Select an application</option>
                        {appsWithBuilds.map((app) => (
                          <option key={app.id} value={app.id}>{app.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Build Number</label>
                        <input
                          type="text"
                          value={registerForm.build_number}
                          onChange={(e) => setRegisterForm({ ...registerForm, build_number: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                          placeholder="123"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Version</label>
                        <input
                          type="text"
                          value={registerForm.version}
                          onChange={(e) => setRegisterForm({ ...registerForm, version: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                          placeholder="1.0.0"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Platform</label>
                        <select
                          value={registerForm.platform}
                          onChange={(e) => setRegisterForm({ ...registerForm, platform: e.target.value as AppOS })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                        >
                          <option value="iOS">iOS</option>
                          <option value="Android">Android</option>
                          <option value="Cross-platform">Cross-platform</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Status</label>
                        <select
                          value={registerForm.status}
                          onChange={(e) => setRegisterForm({ ...registerForm, status: e.target.value as BuildStatus })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                        >
                          <option value="Success">Success</option>
                          <option value="Failed">Failed</option>
                          <option value="Pending">Pending</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Environment</label>
                      <select
                        value={registerForm.environment}
                        onChange={(e) => setRegisterForm({ ...registerForm, environment: e.target.value as BuildEnvironment })}
                        className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                      >
                        <option value="Production">Production</option>
                        <option value="Staging">Staging</option>
                        <option value="Internal">Internal</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Duration</label>
                        <input
                          type="text"
                          value={registerForm.duration}
                          onChange={(e) => setRegisterForm({ ...registerForm, duration: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                          placeholder="5m 30s"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Author</label>
                        <input
                          type="text"
                          value={registerForm.author}
                          onChange={(e) => setRegisterForm({ ...registerForm, author: e.target.value })}
                          className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>

                    {registerError && (
                      <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
                        {registerError}
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowRegisterForm(false)}
                        disabled={registerLoading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={registerLoading}>
                        {registerLoading ? 'Registering...' : 'Register Build'}
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
