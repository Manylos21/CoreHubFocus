'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { KPIWidget } from '@/components/ui/KPIWidget'
import { AppCard } from '@/components/ui/AppCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Smartphone, Plus } from 'lucide-react'
import { getApps } from '@/lib/supabase/apps-client'
import type { DatabaseApp } from '@/lib/supabase/types'

export default function DashboardPage() {
  const router = useRouter()
  
  // Data state
  const [apps, setApps] = useState<DatabaseApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch apps on mount
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true)
      setError('')
      
      const { data, error: fetchError } = await getApps()
      
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        setApps(data)
      }
      
      setLoading(false)
    }

    fetchApps()
  }, [])

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar currentPath="/dashboard" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar title="Mobile Apps Command Center" showNewAppButton={true} />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center py-12">
              <div className="text-[#888888]">Loading dashboard...</div>
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
          <Topbar title="Mobile Apps Command Center" showNewAppButton={true} />
          <main className="flex-1 overflow-auto p-6">
            <Card className="p-12 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Error loading dashboard</h2>
              <p className="text-[#FF0000] mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </Card>
          </main>
        </div>
      </div>
    )
  }

  // Calculate KPIs from Supabase apps
  const totalApps = apps.length
  const activeApps = apps.filter((app) => app.status === 'Active').length
  const archivedApps = apps.filter((app) => app.status === 'Archived').length
  const completeDocs = apps.filter((app) => app.documentation_status === 'Complete').length
  const docHealth = totalApps > 0 ? Math.round((completeDocs / totalApps) * 100) : 0
  const lastBuildApp = apps.length > 0 ? apps[0] : null

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPath="/dashboard" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Mobile Apps Command Center" showNewAppButton={true} />
        <main className="flex-1 overflow-auto p-6">
          {/* Section KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPIWidget 
              label="Total Applications" 
              value={totalApps.toString()} 
              description="All apps in portfolio"
            />
            <KPIWidget 
              label="Applications Actives" 
              value={activeApps.toString()} 
              description="Currently in production"
            />
            <KPIWidget 
              label="Applications Archivées" 
              value={archivedApps.toString()} 
              description="No longer maintained"
            />
            <KPIWidget 
              label="Santé Documentaire" 
              value={docHealth.toString()} 
              unit="%" 
              description={`${completeDocs}/${totalApps} apps complete`}
              trend={{ value: 0, isPositive: true }}
            />
            <KPIWidget 
              label="Dernier Build" 
              value="No builds yet" 
              description={lastBuildApp ? `${lastBuildApp.name} v${lastBuildApp.version || '1.0.0'}` : 'N/A'}
            />
          </div>

          {/* Section Applications */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Applications</h2>
            
            {/* Empty state */}
            {apps.length === 0 && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#222222] flex items-center justify-center mx-auto mb-4">
                  <Smartphone size={32} className="text-[#888888]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No applications yet</h2>
                <p className="text-[#888888] mb-6">Create your first mobile application to start tracking your portfolio.</p>
                <Button onClick={() => router.push('/apps/new')}>
                  <Plus size={16} className="mr-2" />
                  Nouvelle App
                </Button>
              </Card>
            )}

            {/* Apps list */}
            {apps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {apps.map((app) => (
                  <AppCard
                    key={app.id}
                    name={app.name}
                    description={app.description || 'No description'}
                    version={app.version || '1.0.0'}
                    os={app.os}
                    techStack={['Not specified']}
                    status={app.status}
                    documentationStatus={app.documentation_status}
                    lastBuild="No builds yet"
                    href={`/apps/${app.slug}`}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
