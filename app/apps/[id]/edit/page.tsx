'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Check } from 'lucide-react'
import { getAppBySlug, updateApp, createAppLog, type UpdateAppInput } from '@/lib/supabase/apps-client'
import type { DatabaseApp } from '@/lib/supabase/types'

type AppOS = 'iOS' | 'Android' | 'Cross-platform'
type AppStatus = 'Active' | 'Maintenance' | 'Archived'

export default function EditAppPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.id as string

  const [app, setApp] = useState<DatabaseApp | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    slug: '',
    name: '',
    version: '',
    icon_url: '',
    description: '',
    os: 'iOS' as AppOS,
    status: 'Active' as AppStatus,
    source_code_url: '',
    test_url: '',
  })

  const hydrateFromApp = useCallback((row: DatabaseApp) => {
    setFormData({
      slug: row.slug,
      name: row.name,
      version: row.version ?? '',
      icon_url: row.icon_url ?? '',
      description: row.description ?? '',
      os: row.os,
      status: row.status,
      source_code_url: row.source_code_url ?? '',
      test_url: row.test_url ?? '',
    })
  }, [])

  useEffect(() => {
    const fetchApp = async () => {
      setLoading(true)
      setLoadError('')
      setNotFound(false)
      setApp(null)

      const { data, error: fetchError } = await getAppBySlug(slug)

      if (fetchError) {
        setLoadError(fetchError)
        setLoading(false)
        return
      }

      if (!data) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setApp(data)
      hydrateFromApp(data)
      setLoading(false)
    }

    fetchApp()
  }, [slug, hydrateFromApp])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!app) return

    setSubmitError('')
    setSaving(true)

    if (!formData.name.trim() || !formData.version.trim()) {
      setSubmitError('Name and version are required.')
      setSaving(false)
      return
    }

    const formUpdates: UpdateAppInput = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      version: formData.version.trim(),
      icon_url: formData.icon_url.trim(),
      os: formData.os,
      status: formData.status,
      source_code_url: formData.source_code_url.trim(),
      test_url: formData.test_url.trim(),
    }

    const { data: updated, error: updateError } = await updateApp(app.id, formUpdates)

    if (updateError) {
      setSubmitError(updateError)
      setSaving(false)
      return
    }

    if (updated) {
      setApp(updated)
      hydrateFromApp(updated)
    }

    setSuccess(true)
    setSaving(false)

    await createAppLog({
      app_id: app.id,
      action: 'Application Updated',
      author: 'Clubber',
      description: `App metadata updated to version ${formUpdates.version || app.version}.`,
    })

    setTimeout(() => {
      router.push(`/apps/${app.slug}`)
    }, 1400)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Edit Application" />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading application…</div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Edit Application" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-lg mx-auto rounded-xl border border-[#333333] bg-[#111111] p-8">
              <h1 className="text-xl font-semibold text-white mb-2">Could not load application</h1>
              <p className="text-sm text-[#FF0000] mb-6">{loadError}</p>
              <Link href="/apps">
                <Button variant="primary" className="bg-[#0070F3] hover:bg-[#0056b3]">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Applications
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (notFound || !app) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/apps" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Edit Application" />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-lg mx-auto rounded-xl border border-[#333333] bg-[#111111] p-8 text-center">
              <h1 className="text-xl font-semibold text-white mb-2">Application not found</h1>
              <p className="text-sm text-[#888888] mb-6">
                No application matches this URL slug, or it may have been removed.
              </p>
              <Link href="/apps">
                <Button variant="primary" className="bg-[#0070F3] hover:bg-[#0056b3]">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Applications
                </Button>
              </Link>
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
        <Topbar title={`Edit · ${app.name}`} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <Link
              href={`/apps/${app.slug}`}
              className="inline-flex items-center text-[#888888] hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to application
            </Link>

            {success ? (
              <div className="rounded-xl border border-[#333333] bg-[#111111] p-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#0070F3]/20">
                  <Check size={32} className="text-[#0070F3]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Changes saved</h2>
                <p className="text-sm text-[#888888]">Redirecting to the application page…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="border-[#333333] bg-[#111111]">
                  <h2 className="text-lg font-semibold text-white mb-4">Basic information</h2>
                  <div className="space-y-4">
                    <Input
                      label="Application name"
                      placeholder="My Awesome App"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      error={submitError && !formData.name.trim() ? 'Name is required' : ''}
                    />
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Slug</label>
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={formData.slug}
                        aria-readonly="true"
                        className="w-full cursor-not-allowed rounded-lg border border-[#333333] bg-[#0a0a0a] px-3 py-2 text-[#888888] opacity-90"
                      />
                      <p className="mt-1.5 text-xs text-[#666666]">
                        Slug is fixed so links and integrations stay valid.
                      </p>
                    </div>
                    <Input
                      label="Version"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                      error={submitError && !formData.version.trim() ? 'Version is required' : ''}
                    />
                    <Input
                      label="Icon URL"
                      placeholder="https://example.com/icon.png"
                      value={formData.icon_url}
                      onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    />
                    <Textarea
                      label="Description"
                      placeholder="Brief description of your application"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </Card>

                <Card className="border-[#333333] bg-[#111111]">
                  <h2 className="text-lg font-semibold text-white mb-4">Platform and status</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">OS</label>
                      <select
                        value={formData.os}
                        onChange={(e) =>
                          setFormData({ ...formData, os: e.target.value as AppOS })
                        }
                        className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#0070F3]"
                      >
                        <option value="iOS">iOS</option>
                        <option value="Android">Android</option>
                        <option value="Cross-platform">Cross-platform</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value as AppStatus })
                        }
                        className="w-full rounded-lg border border-[#333333] bg-[#111111] px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-[#0070F3]"
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </Card>

                <Card className="border-[#333333] bg-[#111111]">
                  <h2 className="text-lg font-semibold text-white mb-4">Links</h2>
                  <div className="space-y-4">
                    <Input
                      label="Source code URL"
                      placeholder="https://github.com/username/repo"
                      value={formData.source_code_url}
                      onChange={(e) => setFormData({ ...formData, source_code_url: e.target.value })}
                    />
                    <Input
                      label="Test URL (TestFlight / Play Console)"
                      placeholder="https://testflight.apple.com/…"
                      value={formData.test_url}
                      onChange={(e) => setFormData({ ...formData, test_url: e.target.value })}
                    />
                  </div>
                </Card>

                {submitError && (
                  <div className="rounded-lg border border-[#FF0000]/20 bg-[#FF0000]/10 p-3 text-sm text-[#FF0000]">
                    {submitError}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push(`/apps/${app.slug}`)}
                    disabled={saving}
                    className="border-[#333333] bg-[#111111] text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-[#0070F3] hover:bg-[#0056b3] text-white"
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
