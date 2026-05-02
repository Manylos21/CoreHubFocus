'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getAppBySlug, getAppDocuments, getAppBuilds } from '@/lib/supabase/apps-client'
import type { DatabaseApp } from '@/lib/supabase/types'
import Link from 'next/link'
import { 
  Smartphone, 
  ExternalLink, 
  FileText, 
  Clock, 
  ArrowLeft,
  Edit,
  Trash2,
  Code,
  Globe,
  Rocket
} from 'lucide-react'

export default function AppDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const [app, setApp] = useState<DatabaseApp | null>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [builds, setBuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true)
      setError('')
      
      const { data, error: fetchError } = await getAppBySlug(id)
      
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setApp(data)
        // Fetch documents for this app
        const { data: docs, error: docsError } = await getAppDocuments(data.id)
        if (docs && !docsError) {
          setDocuments(docs)
        }
        // Fetch builds for this app
        const { data: buildsData, error: buildsError } = await getAppBuilds(data.id)
        if (buildsData && !buildsError) {
          setBuilds(buildsData)
        }
      }
      
      setLoading(false)
    }

    fetchApp()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Application" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading application...</div>
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
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Application" />
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error loading application</h2>
              <p className="text-[#FF0000] mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  // Not found state
  if (!app) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Application" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl mx-auto">
              <div className="bg-[#111111] border border-[#333333] rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Application not found</h1>
                <p className="text-[#888888] mb-6">
                  The application you're looking for doesn't exist or has been removed.
                </p>
                <Link href="/apps">
                  <Button variant="primary">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Applications
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const getOSBadge = (os: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning'> = {
      'iOS': 'default',
      'Android': 'success',
      'Cross-platform': 'warning',
    }
    return <Badge variant={variants[os] || 'default'}>{os}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'default' | 'warning'> = {
      'Active': 'success',
      'Archived': 'default',
      'Maintenance': 'warning',
    }
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>
  }

  const getDocBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning'> = {
      'Complete': 'success',
      'Missing': 'warning',
    }
    return <Badge variant={variants[status] || 'warning'}>{status}</Badge>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDocumentByType = (type: string) => {
    return documents.find((doc) => doc.type === type)
  }

  const getBuildStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return <Badge variant="success">Success</Badge>
      case 'Failed':
        return <Badge variant="danger">Failed</Badge>
      case 'Pending':
        return <Badge variant="warning">Pending</Badge>
      default:
        return <Badge variant="default">{status}</Badge>
    }
  }

  const getEnvironmentBadge = (environment: string) => {
    switch (environment) {
      case 'Production':
        return <Badge variant="default">Production</Badge>
      case 'Staging':
        return <Badge variant="success">Staging</Badge>
      case 'Internal':
        return <Badge variant="warning">Internal</Badge>
      default:
        return <Badge variant="default">{environment}</Badge>
    }
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/dashboard" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={app.name} />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <Link href="/apps" className="inline-flex items-center text-[#888888] hover:text-white mb-4 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Applications
            </Link>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {app.icon_url ? (
                  <img 
                    src={app.icon_url} 
                    alt={app.name}
                    className="w-16 h-16 rounded-lg bg-[#222222] object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#222222] flex items-center justify-center">
                    <Smartphone size={32} className="text-[#888888]" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{app.name}</h1>
                  <p className="text-sm text-[#888888]">Version {app.version || '1.0.0'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/apps/${app.slug}/edit`}>
                  <Button variant="secondary" size="sm">
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button variant="danger" size="sm">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              {getOSBadge(app.os)}
              {getStatusBadge(app.status)}
              {getDocBadge(app.documentation_status)}
              <div className="flex items-center gap-1.5 text-sm text-[#888888]">
                <Clock size={14} />
                <span>Last build: No builds yet</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Description</h2>
            <p className="text-[#888888]">{app.description || 'No description provided.'}</p>
          </Card>

          {/* Tech Stack */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#222222] text-[#888888] rounded-lg text-sm">
                Not specified yet
              </span>
            </div>
          </Card>

          {/* Links */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Links</h2>
            <div className="space-y-2">
              {app.source_code_url && (
                <a
                  href={app.source_code_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors"
                >
                  <Code size={16} />
                  Source Code
                  <ExternalLink size={14} className="ml-auto" />
                </a>
              )}
              {app.test_url && (
                <a
                  href={app.test_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors"
                >
                  <Globe size={16} />
                  Test / Deployment
                  <ExternalLink size={14} className="ml-auto" />
                </a>
              )}
              {!app.source_code_url && !app.test_url && (
                <p className="text-[#888888]">No links configured</p>
              )}
            </div>
          </Card>

          {/* Documentation Vault */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText size={18} />
              Documentation Vault
            </h2>
            
            <div className="space-y-4">
              {/* Technical Spec */}
              <div className="p-4 bg-[#222222] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#888888]" />
                    <span className="text-white font-medium">Technical Specification</span>
                  </div>
                  {(() => {
                    const techDoc = getDocumentByType('technical_spec')
                    return techDoc ? (
                      <Badge variant="success">Available</Badge>
                    ) : (
                      <Badge variant="warning">Missing</Badge>
                    )
                  })()}
                </div>
                {(() => {
                  const techDoc = getDocumentByType('technical_spec')
                  if (techDoc) {
                    return (
                      <div className="space-y-1">
                        <p className="text-sm text-[#888888]">{techDoc.title}</p>
                        <a
                          href={techDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0070F3] hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                    )
                  }
                  return <p className="text-sm text-[#888888]">No technical specification available.</p>
                })()}
              </div>

              {/* Design Spec */}
              <div className="p-4 bg-[#222222] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#888888]" />
                    <span className="text-white font-medium">Design Specification</span>
                  </div>
                  {(() => {
                    const designDoc = getDocumentByType('design_spec')
                    return designDoc ? (
                      <Badge variant="success">Available</Badge>
                    ) : (
                      <Badge variant="warning">Missing</Badge>
                    )
                  })()}
                </div>
                {(() => {
                  const designDoc = getDocumentByType('design_spec')
                  if (designDoc) {
                    return (
                      <div className="space-y-1">
                        <p className="text-sm text-[#888888]">{designDoc.title}</p>
                        <a
                          href={designDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#0070F3] hover:underline"
                        >
                          View Document
                        </a>
                      </div>
                    )
                  }
                  return <p className="text-sm text-[#888888]">No design specification available.</p>
                })()}
              </div>
            </div>
          </Card>

          {/* Build History */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Rocket size={18} />
              Build History
            </h2>
            
            {builds.length === 0 ? (
              <div className="p-4 bg-[#222222] rounded-lg">
                <p className="text-sm text-[#888888]">No builds yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {builds.slice(0, 3).map((build) => (
                  <div key={build.id} className="p-4 bg-[#222222] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">Build #{build.build_number}</span>
                        <span className="text-sm text-[#888888]">v{build.version}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getBuildStatusBadge(build.status)}
                        {getEnvironmentBadge(build.environment)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[#888888]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} />
                        <span>{formatDate(build.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Rocket size={12} />
                        <span>{build.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Logs */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={18} />
              Activity Logs
            </h2>
            <p className="text-[#888888]">No logs yet</p>
          </Card>

          {/* Footer Info */}
          <div className="mt-6 flex items-center gap-4 text-xs text-[#666666]">
            <span>Created: {formatDate(app.created_at)}</span>
            <span>•</span>
            <span>Updated: {formatDate(app.updated_at)}</span>
          </div>
        </main>
      </div>
    </div>
  )
}
