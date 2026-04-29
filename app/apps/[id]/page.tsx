'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { StatusDot } from '@/components/ui/StatusDot'
import { KPIWidget } from '@/components/ui/KPIWidget'
import { DeleteAppModal } from '@/components/ui/DeleteAppModal'
import { Smartphone, Edit, Trash2, ExternalLink, Clock, FileText, Image, Check, X, Plus, FolderOpen, Upload } from 'lucide-react'
import { 
  getAppById, 
  getAppLogs, 
  getAppKPIs, 
  getAppDocuments, 
  deleteApp,
  createOrUpdateAppDocument,
  getDocumentationCompleteness,
  getPrimaryDocument,
  getScreenshotDocuments
} from '@/lib/supabase/apps-client'
import type { MobileApp, AppLog, AppKPI, AppDocument, OS, AppStatus, DeploymentStatus, DocumentType } from '@/types/app'

export default function AppDetailPage() {
  const router = useRouter()
  const params = useParams()
  const appId = params.id as string
  
  const [app, setApp] = useState<MobileApp | null>(null)
  const [logs, setLogs] = useState<AppLog[]>([])
  const [kpis, setKpis] = useState<AppKPI | null>(null)
  const [documents, setDocuments] = useState<AppDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [documentForm, setDocumentForm] = useState<{
    type: DocumentType
    title: string
    external_url: string
    file_url: string
    mime_type: string
  }>({
    type: 'technical_spec' as DocumentType,
    title: '',
    external_url: '',
    file_url: '',
    mime_type: '',
  })
  const [savingDocument, setSavingDocument] = useState(false)
  const [documentSuccess, setDocumentSuccess] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [appData, logsData, kpisData, documentsData] = await Promise.all([
        getAppById(appId),
        getAppLogs(appId),
        getAppKPIs(appId),
        getAppDocuments(appId),
      ])
      
      if (!appData) {
        setError('Application not found')
        return
      }
      
      setApp(appData)
      setLogs(logsData)
      setKpis(kpisData)
      setDocuments(documentsData)
    } catch (err) {
      setError('Failed to load application details')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [appId])

  const handleDelete = async () => {
    if (!app) return
    
    try {
      await deleteApp(appId, app.name)
      setShowDeleteModal(false)
      router.push('/apps')
    } catch (err) {
      setError('Failed to delete application')
      setShowDeleteModal(false)
    }
  }

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDocument(true)
    setDocumentSuccess('')
    setError('')

    if (!documentForm.title) {
      setError('Title is required')
      setSavingDocument(false)
      return
    }

    if (!documentForm.external_url && !documentForm.file_url) {
      setError('At least external_url or file_url is required')
      setSavingDocument(false)
      return
    }

    try {
      await createOrUpdateAppDocument(appId, {
        type: documentForm.type,
        title: documentForm.title,
        external_url: documentForm.external_url || undefined,
        file_url: documentForm.file_url || undefined,
        mime_type: documentForm.mime_type || undefined,
      } as any)

      setDocumentSuccess('Document saved successfully')
      setShowDocumentModal(false)
      setDocumentForm({
        type: 'technical_spec' as DocumentType,
        title: '',
        external_url: '',
        file_url: '',
        mime_type: '',
      })

      // Refresh documents
      const documentsData = await getAppDocuments(appId)
      setDocuments(documentsData)
    } catch (err) {
      setError('Failed to save document')
    } finally {
      setSavingDocument(false)
    }
  }

  const getLogIcon = (action: string) => {
    switch (action) {
      case 'created': return <Check size={16} className="text-[#00CC88]" />
      case 'updated': return <Edit size={16} className="text-[#0070F3]" />
      case 'deleted': return <Trash2 size={16} className="text-[#FF0000]" />
      case 'document_added': return <Plus size={16} className="text-[#00CC88]" />
      case 'document_updated': return <Upload size={16} className="text-[#0070F3]" />
      default: return <Clock size={16} className="text-[#888888]" />
    }
  }

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

  const hasTechnicalSpec = documents.some(d => d.type === 'technical_spec' as any)
  const hasGraphicSpec = documents.some(d => d.type === 'graphic_spec' as any)
  const docCompleteness = getDocumentationCompleteness(documents)
  const technicalSpec = getPrimaryDocument(documents, 'technical_spec' as any)
  const graphicSpec = getPrimaryDocument(documents, 'graphic_spec' as any)
  const screenshots = getScreenshotDocuments(documents)

  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Application Details" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Application Details" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
              {error || 'Application not found'}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/apps" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={app.name} />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {app.icon_url ? (
                  <img
                    src={app.icon_url}
                    alt={app.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-[#111111] flex items-center justify-center">
                    <Smartphone size={32} className="text-[#888888]" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">{app.name}</h1>
                  <p className="text-sm text-[#888888]">Version {app.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusDot status={getDeploymentStatus(app.deployment_status)} />
                <Link href={`/apps/${app.id}/edit`}>
                  <Button variant="secondary">
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getOSBadge(app.os)}
              {getStatusBadge(app.status)}
              <Badge variant={app.deployment_status === 'green' ? 'success' : app.deployment_status === 'orange' ? 'warning' : 'danger'}>
                {app.deployment_status.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* KPIs */}
          {kpis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KPIWidget label="Downloads" value={kpis.downloads.toString()} />
              <KPIWidget label="Crashes" value={kpis.crashes.toString()} />
              <KPIWidget label="Active Users" value={kpis.active_users.toString()} />
              <KPIWidget
                label="Doc Completeness"
                value={`${docCompleteness}%`}
                trend={{ value: docCompleteness, isPositive: docCompleteness > 0 }}
              />
            </div>
          )}

          {/* Technical Overview */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Technical Overview</h3>
            {app.short_description && (
              <p className="text-[#888888] mb-4">{app.short_description}</p>
            )}
            {app.tech_stack && app.tech_stack.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-white mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {app.tech_stack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-[#111111] text-[#888888] rounded-lg text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Links</h4>
              <div className="space-y-2">
                {app.repository_url ? (
                  <a
                    href={app.repository_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink size={14} />
                    Repository
                  </a>
                ) : (
                  <p className="text-sm text-[#666666]">Repository: Not provided</p>
                )}
                {app.testflight_url ? (
                  <a
                    href={app.testflight_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink size={14} />
                    TestFlight
                  </a>
                ) : (
                  <p className="text-sm text-[#666666]">TestFlight: Not provided</p>
                )}
                {app.play_console_url ? (
                  <a
                    href={app.play_console_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink size={14} />
                    Play Console
                  </a>
                ) : (
                  <p className="text-sm text-[#666666]">Play Console: Not provided</p>
                )}
                {app.api_status_url ? (
                  <a
                    href={app.api_status_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors text-sm"
                  >
                    <ExternalLink size={14} />
                    API Status
                  </a>
                ) : (
                  <p className="text-sm text-[#666666]">API Status: Not provided</p>
                )}
              </div>
            </div>
          </Card>

          {/* Documentation Vault */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FolderOpen size={18} />
                Documentation Vault
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDocumentModal(true)}
              >
                <Plus size={14} className="mr-2" />
                Add Document
              </Button>
            </div>

            <div className="space-y-4">
              {/* Technical Spec */}
              <div className="p-4 bg-[#111111] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#888888]" />
                    <span className="text-white font-medium">Technical Specification</span>
                  </div>
                  {technicalSpec ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="warning">Missing</Badge>
                  )}
                </div>
                {technicalSpec ? (
                  <div className="space-y-1">
                    <p className="text-sm text-[#888888]">{technicalSpec.title}</p>
                    {(technicalSpec.file_url || technicalSpec.external_url) && (
                      <a
                        href={technicalSpec.file_url || technicalSpec.external_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0070F3] hover:underline"
                      >
                        View Document
                      </a>
                    )}
                    <p className="text-xs text-[#666666]">
                      Added {new Date(technicalSpec.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#888888]">No technical specification available. Add one to document your app's technical requirements.</p>
                )}
              </div>

              {/* Graphic Spec */}
              <div className="p-4 bg-[#111111] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Image size={16} className="text-[#888888]" />
                    <span className="text-white font-medium">Graphic Specification</span>
                  </div>
                  {graphicSpec ? (
                    <Badge variant="success">Available</Badge>
                  ) : (
                    <Badge variant="warning">Missing</Badge>
                  )}
                </div>
                {graphicSpec ? (
                  <div className="space-y-1">
                    <p className="text-sm text-[#888888]">{graphicSpec.title}</p>
                    {(graphicSpec.file_url || graphicSpec.external_url) && (
                      <a
                        href={graphicSpec.file_url || graphicSpec.external_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[#0070F3] hover:underline"
                      >
                        View Document
                      </a>
                    )}
                    <p className="text-xs text-[#666666]">
                      Added {new Date(graphicSpec.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-[#888888]">No graphic specification available. Add one to document your app's design requirements.</p>
                )}
              </div>

              {/* Screenshots */}
              {screenshots.length > 0 && (
                <div className="p-4 bg-[#111111] rounded-lg">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Image size={16} className="text-[#888888]" />
                    Screenshots ({screenshots.length})
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {screenshots.map((screenshot) => (
                      <div key={screenshot.id} className="relative group">
                        {screenshot.file_url ? (
                          <img
                            src={screenshot.file_url}
                            alt={screenshot.title}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ) : (
                          <a
                            href={screenshot.external_url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-24 bg-[#222222] rounded-lg flex items-center justify-center text-xs text-[#888888] hover:text-white transition-colors"
                          >
                            {screenshot.title}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Logs */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Clock size={18} />
              Activity Log
            </h3>
            {logs.length === 0 ? (
              <p className="text-[#888888]">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-[#111111] rounded-lg"
                  >
                    <div className="mt-0.5">{getLogIcon(log.action)}</div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium capitalize">{log.action.replace(/_/g, ' ')}</p>
                      {log.details && (
                        <p className="text-[#888888] text-sm">{log.details}</p>
                      )}
                    </div>
                    <p className="text-[#888888] text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Document Modal */}
          {showDocumentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowDocumentModal(false)}
              />
              <div className="relative bg-[#111111] border border-[#333333] rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold text-white mb-4">Add Document</h3>
                <form onSubmit={handleDocumentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Type</label>
                    <select
                      value={documentForm.type}
                      onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value as DocumentType })}
                      className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                    >
                      <option value="technical_spec">Technical Specification</option>
                      <option value="graphic_spec">Graphic Specification</option>
                      <option value="screenshot">Screenshot</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    label="Title"
                    placeholder="Document title"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                  />
                  <Input
                    label="External URL"
                    placeholder="https://example.com/document.pdf"
                    value={documentForm.external_url}
                    onChange={(e) => setDocumentForm({ ...documentForm, external_url: e.target.value })}
                  />
                  <Input
                    label="File URL"
                    placeholder="https://storage.example.com/file.pdf"
                    value={documentForm.file_url}
                    onChange={(e) => setDocumentForm({ ...documentForm, file_url: e.target.value })}
                  />
                  <Input
                    label="MIME Type (optional)"
                    placeholder="application/pdf"
                    value={documentForm.mime_type}
                    onChange={(e) => setDocumentForm({ ...documentForm, mime_type: e.target.value })}
                  />
                  {error && (
                    <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
                      {error}
                    </div>
                  )}
                  {documentSuccess && (
                    <div className="text-sm text-[#00CC88] bg-[#00CC88]/10 border border-[#00CC88]/20 rounded-lg p-3">
                      {documentSuccess}
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowDocumentModal(false)}
                      disabled={savingDocument}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={savingDocument}>
                      {savingDocument ? 'Saving...' : 'Save Document'}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          <DeleteAppModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            appName={app.name}
          />
        </main>
      </div>
    </div>
  )
}
