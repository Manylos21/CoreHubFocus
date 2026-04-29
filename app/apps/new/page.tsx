'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { createApp } from '@/lib/supabase/apps-client'
import type { OS, AppStatus, DeploymentStatus } from '@/types/app'

export default function NewAppPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    version: '',
    icon_url: '',
    short_description: '',
    os: 'ios' as OS,
    status: 'active' as AppStatus,
    deployment_status: 'green' as DeploymentStatus,
    tech_stack: '',
    repository_url: '',
    testflight_url: '',
    play_console_url: '',
    api_status_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.name || !formData.version || !formData.os) {
      setError('Name, version, and OS are required')
      setLoading(false)
      return
    }

    try {
      const techStackArray = formData.tech_stack
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0)

      const app = await createApp({
        name: formData.name,
        version: formData.version,
        icon_url: formData.icon_url || undefined,
        short_description: formData.short_description || undefined,
        os: formData.os,
        status: formData.status,
        deployment_status: formData.deployment_status,
        tech_stack: techStackArray.length > 0 ? techStackArray : undefined,
        repository_url: formData.repository_url || undefined,
        testflight_url: formData.testflight_url || undefined,
        play_console_url: formData.play_console_url || undefined,
        api_status_url: formData.api_status_url || undefined,
      })

      router.push(`/apps/${app.id}`)
    } catch (err) {
      setError('Failed to create application. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/apps" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="New Application" />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <Input
                    label="Application Name"
                    placeholder="My Awesome App"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={error && !formData.name ? 'Name is required' : ''}
                  />
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
                    <label className="block text-sm font-medium text-white mb-2">Platform</label>
                    <select
                      value={formData.os}
                      onChange={(e) => setFormData({ ...formData, os: e.target.value as OS })}
                      className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                    >
                      <option value="ios">iOS</option>
                      <option value="android">Android</option>
                      <option value="cross_platform">Cross-Platform</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AppStatus })}
                      className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                    >
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Deployment Status</label>
                    <select
                      value={formData.deployment_status}
                      onChange={(e) => setFormData({ ...formData, deployment_status: e.target.value as DeploymentStatus })}
                      className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]"
                    >
                      <option value="green">Green</option>
                      <option value="orange">Orange</option>
                      <option value="red">Red</option>
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

              {/* Links */}
              <Card>
                <h2 className="text-lg font-semibold text-white mb-4">Links</h2>
                <div className="space-y-4">
                  <Input
                    label="Repository URL"
                    placeholder="https://github.com/username/repo"
                    value={formData.repository_url}
                    onChange={(e) => setFormData({ ...formData, repository_url: e.target.value })}
                  />
                  <Input
                    label="TestFlight URL"
                    placeholder="https://testflight.apple.com/..."
                    value={formData.testflight_url}
                    onChange={(e) => setFormData({ ...formData, testflight_url: e.target.value })}
                  />
                  <Input
                    label="Play Console URL"
                    placeholder="https://play.google.com/..."
                    value={formData.play_console_url}
                    onChange={(e) => setFormData({ ...formData, play_console_url: e.target.value })}
                  />
                  <Input
                    label="API Status URL"
                    placeholder="https://status.example.com"
                    value={formData.api_status_url}
                    onChange={(e) => setFormData({ ...formData, api_status_url: e.target.value })}
                  />
                </div>
              </Card>

              {/* Error */}
              {error && (
                <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Application'}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
