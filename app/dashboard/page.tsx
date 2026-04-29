import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { KPIWidget } from '@/components/ui/KPIWidget'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Smartphone } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/dashboard" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPIWidget label="Total Apps" value="12" />
            <KPIWidget label="Active Versions" value="24" />
            <KPIWidget label="Total Downloads" value="45.2" unit="K" trend={{ value: 12, isPositive: true }} />
            <KPIWidget label="Crash Rate" value="0.02" unit="%" trend={{ value: 5, isPositive: false }} />
          </div>

          <Card>
            <EmptyState
              icon={Smartphone}
              title="No applications yet"
              description="Create your first application to get started with CoreHubFocus"
              action={{
                label: 'Create Application',
                onClick: () => {}
              }}
            />
          </Card>
        </main>
      </div>
    </div>
  )
}
