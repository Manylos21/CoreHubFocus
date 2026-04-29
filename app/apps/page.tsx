'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusDot } from '@/components/ui/StatusDot'
import { EmptyState } from '@/components/ui/EmptyState'
import { Smartphone, Plus, Search } from 'lucide-react'
import { getApps } from '@/lib/supabase/apps-client'
import type { MobileApp, OS, AppStatus, DeploymentStatus } from '@/types/app'

export default function AppsPage() {
  const router = useRouter()
  const [apps, setApps] = useState<MobileApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filters
  const [search, setSearch] = useState('')
  const [osFilter, setOsFilter] = useState<OS | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [deploymentFilter, setDeploymentFilter] = useState<DeploymentStatus | 'all'>('all')

  const fetchApps = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getApps({
        search: search || undefined,
        os: osFilter,
        status: statusFilter,
        deployment_status: deploymentFilter,
      })
      setApps(data)
    } catch (err) {
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [search, osFilter, statusFilter, deploymentFilter])

  const getOSBadge = (os: OS) => {
    const variants: Record<OS, 'default' | 'success' | 'warning'> = {
      ios: 'default',
      android: 'success',
      cross_platform: 'warning',
    }
    return <Badge variant={variants[os]}>{os === 'cross_platform' ? 'Cross-Platform' : os.toUpperCase()}</Badge>
  }

  const getStatusBadge = (status: AppStatus) => {
    return status === 'active' ? <Badge variant="success">Active</Badge> : <Badge variant="default">Archived</Badge>
  }

  const getDeploymentStatus = (status: DeploymentStatus): 'online' | 'warning' | 'error' => {
    switch (status) {
      case 'green': return 'online'
      case 'orange': return 'warning'
      case 'red': return 'error'
    }
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/apps" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Applications" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header with search and filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Applications</h1>
              <Button onClick={() => router.push('/apps/new')}>
                <Plus size={16} className="mr-2" />
                New Application
              </Button>
            </div>
            
            <div className="flex gap-4">
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
                value={osFilter}
                onChange={(e) => setOsFilter(e.target.value as OS | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All OS</option>
                <option value="ios">iOS</option>
                <option value="android">Android</option>
                <option value="cross_platform">Cross-Platform</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
              <select
                value={deploymentFilter}
                onChange={(e) => setDeploymentFilter(e.target.value as DeploymentStatus | 'all')}
                className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-[#0070F3]"
              >
                <option value="all">All Deployment</option>
                <option value="green">Green</option>
                <option value="orange">Orange</option>
                <option value="red">Red</option>
              </select>
            </div>
          </div>

          {/* Error state */}
          {error && (
            <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading applications...</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && apps.length === 0 && (
            <Card>
              <EmptyState
                icon={Smartphone}
                title="No applications found"
                description={search || osFilter !== 'all' || statusFilter !== 'all' || deploymentFilter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first application to get started'
                }
                action={search || osFilter !== 'all' || statusFilter !== 'all' || deploymentFilter !== 'all'
                  ? undefined
                  : { label: 'Create Application', href: '/apps/new' }
                }
              />
            </Card>
          )}

          {/* Apps list */}
          {!loading && apps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {apps.map((app) => (
                <Card
                  key={app.id}
                  className="cursor-pointer hover:border-[#FFFFFF] transition-colors"
                  onClick={() => router.push(`/apps/${app.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {app.icon_url ? (
                        <img
                          src={app.icon_url}
                          alt={app.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#111111] flex items-center justify-center">
                          <Smartphone size={24} className="text-[#888888]" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-semibold">{app.name}</h3>
                        <p className="text-sm text-[#888888]">{app.version}</p>
                      </div>
                    </div>
                    <StatusDot status={getDeploymentStatus(app.deployment_status)} />
                  </div>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {getOSBadge(app.os)}
                    {getStatusBadge(app.status)}
                  </div>
                  
                  {app.short_description && (
                    <p className="text-sm text-[#888888] line-clamp-2 mb-3">
                      {app.short_description}
                    </p>
                  )}
                  
                  {app.tech_stack && app.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {app.tech_stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-1 bg-[#111111] text-[#888888] rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {app.tech_stack.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-[#111111] text-[#888888] rounded">
                          +{app.tech_stack.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
