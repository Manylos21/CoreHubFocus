'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Smartphone, ArrowLeft, Check } from 'lucide-react'
import { createApp, checkSlugExists, createAppDocument, type CreateAppInput } from '@/lib/supabase/apps-client'

export default function NewAppPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [warning, setWarning] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    version: '',
    icon_url: '',
    short_description: '',
    os: 'iOS' as 'iOS' | 'Android' | 'Cross-platform',
    status: 'Active' as 'Active' | 'Maintenance' | 'Archived',
    tech_stack: '',
    technical_spec_url: '',
    graphic_spec_url: '',
    source_code_url: '',
    test_url: '',
  })

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: generateSlug(value),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWarning('')
    setLoading(true)

    // Validation
    if (!formData.name || !formData.slug || !formData.version || !formData.os || !formData.status) {
      setError('Name, slug, version, OS, and status are required')
      setLoading(false)
      return
    }

    // Check if slug already exists
    const slugExists = await checkSlugExists(formData.slug)
    if (slugExists) {
      setError('An application with this slug already exists')
      setLoading(false)
      return
    }

    // Determine documentation status
    const hasTechnicalSpec = formData.technical_spec_url.length > 0
    const hasGraphicSpec = formData.graphic_spec_url.length > 0
    const documentationStatus: 'Complete' | 'Missing' = (hasTechnicalSpec && hasGraphicSpec) ? 'Complete' : 'Missing'

    // Prepare input for Supabase
    const appInput: CreateAppInput = {
      slug: formData.slug,
      name: formData.name,
      description: formData.short_description || undefined,
      version: formData.version,
      icon_url: formData.icon_url || undefined,
      os: formData.os,
      status: formData.status,
      documentation_status: documentationStatus,
      source_code_url: formData.source_code_url || undefined,
      test_url: formData.test_url || undefined,
    }

    const { data, error: createError } = await createApp(appInput)

    if (createError) {
      setError(createError)
      setLoading(false)
      return
    }

    // Create documents if URLs are provided
    const warnings: string[] = []
    
    if (data && data.id) {
      if (formData.technical_spec_url) {
        const { error: docError } = await createAppDocument({
          app_id: data.id,
          type: 'technical_spec',
          title: 'Technical Specification',
          url: formData.technical_spec_url,
          status: 'Available',
        })
        if (docError) {
          warnings.push('Failed to create technical spec document')
        }
      }

      if (formData.graphic_spec_url) {
        const { error: docError } = await createAppDocument({
          app_id: data.id,
          type: 'design_spec',
          title: 'Design Specification',
          url: formData.graphic_spec_url,
          status: 'Available',
        })
        if (docError) {
          warnings.push('Failed to create design spec document')
        }
      }
    }

    if (warnings.length > 0) {
      setWarning(warnings.join('. '))
    }

    setSuccess(true)
    setLoading(false)
    
    // Redirect to apps after showing success
    setTimeout(() => {
      router.push('/apps')
    }, 1500)
  }

  const techStackArray = formData.tech_stack
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/apps" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="New Application" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-6">
              {/* Form */}
              <div className="flex-1">
                <div className="mb-4">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center text-[#888888] hover:text-white transition-colors"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Dashboard
                  </button>
                </div>

                {success ? (
                  <Card className="p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#00CC88]/20 flex items-center justify-center mx-auto mb-4">
                      <Check size={32} className="text-[#00CC88]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Application Created!</h2>
                    <p className="text-[#888888] mb-4">
                      {formData.name} has been successfully created.
                    </p>
                    <p className="text-sm text-[#666666]">Redirecting to dashboard...</p>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                      <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                      <div className="space-y-4">
                        <Input
                          label="Application Name"
                          placeholder="My Awesome App"
                          value={formData.name}
                          onChange={(e) => handleNameChange(e.target.value)}
                          error={error && !formData.name ? 'Name is required' : ''}
                        />
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Slug</label>
                          <div className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-[#888888]">
                            {formData.slug || 'auto-generated from name'}
                          </div>
                        </div>
                        <Input
                          label="Version"
                          placeholder="1.0.0"
                          value={formData.version}
                          onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                          error={error && !formData.version ? 'Version is required' : ''}
                        />
                        <Input
                          label="Icon URL"
                          placeholder="https://example.com/icon.png"
                          value={formData.icon_url}
                          onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                        />
                        <Textarea
                          label="Short Description"
                          placeholder="Brief description of your application"
                          value={formData.short_description}
                          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </Card>

                    {/* Platform and Status */}
                    <Card>
                      <h2 className="text-lg font-semibold text-white mb-4">Platform and Status</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">OS</label>
                          <select
                            value={formData.os}
                            onChange={(e) => setFormData({ ...formData, os: e.target.value as 'iOS' | 'Android' | 'Cross-platform' })}
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
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Maintenance' | 'Archived' })}
                            className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                          >
                            <option value="Active">Active</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </Card>

                    {/* Tech Stack */}
                    <Card>
                      <h2 className="text-lg font-semibold text-white mb-4">Tech Stack</h2>
                      <Textarea
                        label="Technologies (comma-separated)"
                        placeholder="React Native, TypeScript, Redux, etc."
                        value={formData.tech_stack}
                        onChange={(e) => setFormData({ ...formData, tech_stack: e.target.value })}
                        rows={2}
                      />
                    </Card>

                    {/* Documentation */}
                    <Card>
                      <h2 className="text-lg font-semibold text-white mb-4">Documentation</h2>
                      <div className="space-y-4">
                        <Input
                          label="Technical Spec URL"
                          placeholder="https://docs.google.com/document/..."
                          value={formData.technical_spec_url}
                          onChange={(e) => setFormData({ ...formData, technical_spec_url: e.target.value })}
                        />
                        <Input
                          label="Graphic Spec URL (Figma)"
                          placeholder="https://figma.com/file/..."
                          value={formData.graphic_spec_url}
                          onChange={(e) => setFormData({ ...formData, graphic_spec_url: e.target.value })}
                        />
                      </div>
                    </Card>

                    {/* Links */}
                    <Card>
                      <h2 className="text-lg font-semibold text-white mb-4">Links</h2>
                      <div className="space-y-4">
                        <Input
                          label="Source Code URL"
                          placeholder="https://github.com/username/repo"
                          value={formData.source_code_url}
                          onChange={(e) => setFormData({ ...formData, source_code_url: e.target.value })}
                        />
                        <Input
                          label="Test URL (TestFlight / Play Console)"
                          placeholder="https://testflight.apple.com/..."
                          value={formData.test_url}
                          onChange={(e) => setFormData({ ...formData, test_url: e.target.value })}
                        />
                      </div>
                    </Card>

                    {/* Error */}
                    {error && (
                      <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
                        {error}
                      </div>
                    )}

                    {/* Warning */}
                    {warning && (
                      <div className="text-sm text-[#FFA500] bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-lg p-3">
                        {warning}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => router.push('/dashboard')}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Application'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Preview */}
              {!success && (
                <div className="w-80">
                  <div className="sticky top-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Preview</h3>
                    <Card className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-[#222222] flex items-center justify-center">
                          <Smartphone size={24} className="text-[#888888]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium truncate">{formData.name || 'App Name'}</h4>
                          <p className="text-xs text-[#888888]">v{formData.version || '1.0.0'}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#888888]">OS</span>
                          <Badge variant="default" className="text-xs">{formData.os}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#888888]">Status</span>
                          <Badge 
                            variant={formData.status === 'Active' ? 'success' : formData.status === 'Maintenance' ? 'warning' : 'default'} 
                            className="text-xs"
                          >
                            {formData.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#888888]">Slug</span>
                          <span className="text-xs text-[#0070F3] truncate max-w-[120px]">
                            {formData.slug || 'auto-generated'}
                          </span>
                        </div>
                      </div>

                      {techStackArray.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-xs text-[#888888] mb-2">Tech Stack</p>
                          <div className="flex flex-wrap gap-1">
                            {techStackArray.slice(0, 4).map((tech) => (
                              <span
                                key={tech}
                                className="px-2 py-0.5 bg-[#222222] text-[#888888] rounded text-xs"
                              >
                                {tech}
                              </span>
                            ))}
                            {techStackArray.length > 4 && (
                              <span className="text-xs text-[#666666]">+{techStackArray.length - 4}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {formData.short_description && (
                        <div className="mt-4 pt-4 border-t border-[#333333]">
                          <p className="text-xs text-[#888888] mb-1">Description</p>
                          <p className="text-xs text-[#666666] line-clamp-3">{formData.short_description}</p>
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
