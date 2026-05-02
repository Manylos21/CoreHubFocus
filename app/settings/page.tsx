import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Building2, 
  Shield, 
  HardDrive, 
  FileText, 
  AlertTriangle, 
  Zap,
  CheckCircle,
  Clock,
  FlaskConical
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/settings" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Settings" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
            <p className="text-sm text-[#888888]">Configure workspace preferences, access and platform behavior.</p>
          </div>

          <div className="space-y-6">
            {/* Workspace Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Building2 size={20} className="text-[#888888]" />
                <h2 className="text-lg font-semibold text-white">Workspace</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Workspace name</label>
                  <div className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white">
                    CoreHub Focus
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Owner</label>
                  <div className="bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white">
                    Clubber
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Environment</label>
                  <select className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]">
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Default platform</label>
                  <select className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#0070F3]">
                    <option>Cross-platform</option>
                    <option>iOS</option>
                    <option>Android</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Access Control Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-[#888888]" />
                <h2 className="text-lg font-semibold text-white">Access Control</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Auth provider</p>
                    <p className="text-sm text-[#888888]">Supabase Auth</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Access mode</p>
                    <p className="text-sm text-[#888888]">Restricted user access</p>
                  </div>
                  <Badge variant="warning">Restricted</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Session persistence</p>
                    <p className="text-sm text-[#888888]">Keep users logged in</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Database sync</p>
                    <p className="text-sm text-[#888888]">Real-time data synchronization</p>
                  </div>
                  <Badge variant="success">Enabled</Badge>
                </div>
              </div>
            </Card>

            {/* Storage & Documentation Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <HardDrive size={20} className="text-[#888888]" />
                <h2 className="text-lg font-semibold text-white">Storage & Documentation</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Storage provider</p>
                    <p className="text-sm text-[#888888]">Supabase Storage</p>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Technical specs</p>
                    <p className="text-sm text-[#888888]">Required for all apps</p>
                  </div>
                  <Badge variant="success">Required</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Design specs</p>
                    <p className="text-sm text-[#888888]">Required for all apps</p>
                  </div>
                  <Badge variant="success">Required</Badge>
                </div>
                <div className="p-3 bg-[#111111] rounded-lg">
                  <p className="text-white font-medium mb-2">Supported formats</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#222222] text-[#888888] rounded text-xs">PDF</span>
                    <span className="px-2 py-1 bg-[#222222] text-[#888888] rounded text-xs">Markdown</span>
                    <span className="px-2 py-1 bg-[#222222] text-[#888888] rounded text-xs">Figma URL</span>
                    <span className="px-2 py-1 bg-[#222222] text-[#888888] rounded text-xs">Images</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Danger Zone Section */}
            <Card className="border-[#FF0000]/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} className="text-[#FF0000]" />
                <h2 className="text-lg font-semibold text-[#FF0000]">Danger Zone</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Archive inactive apps</p>
                    <p className="text-sm text-[#888888]">Move inactive apps to archive</p>
                  </div>
                  <Button variant="danger" className="border border-[#FF0000] bg-transparent hover:bg-[#FF0000]/10">
                    Archive
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Reset mock data</p>
                    <p className="text-sm text-[#888888]">Restore default mock applications</p>
                  </div>
                  <Button variant="danger" className="border border-[#FF0000] bg-transparent hover:bg-[#FF0000]/10">
                    Reset
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div>
                    <p className="text-white font-medium">Delete workspace</p>
                    <p className="text-sm text-[#888888]">Permanently delete this workspace</p>
                  </div>
                  <Button variant="danger" className="hover:bg-[#FF0000]">
                    Delete
                  </Button>
                </div>
              </div>
            </Card>

            {/* Future Integrations Section */}
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <Zap size={20} className="text-[#888888]" />
                <h2 className="text-lg font-semibold text-white">Future Integrations</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#888888]" />
                    <p className="text-white">PDF auto-generation</p>
                  </div>
                  <Badge variant="default">Planned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-[#888888]" />
                    <p className="text-white">Notifications for outdated documentation</p>
                  </div>
                  <Badge variant="default">Planned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={16} className="text-[#888888]" />
                    <p className="text-white">Store API analytics</p>
                  </div>
                  <Badge variant="warning">Later</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle size={16} className="text-[#888888]" />
                    <p className="text-white">Crash reporting</p>
                  </div>
                  <Badge variant="warning">Later</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#111111] rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-[#888888]" />
                    <p className="text-white">Role-based access control</p>
                  </div>
                  <Badge variant="default">Experimental</Badge>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
