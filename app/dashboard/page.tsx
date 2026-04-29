import { Sidebar } from '@/components/ui/Sidebar'
import { Topbar } from '@/components/ui/Topbar'
import { KPIWidget } from '@/components/ui/KPIWidget'
import { Smartphone, FileText, Activity } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-black">
      <div className="hidden md:block">
        <Sidebar currentPath="/dashboard" />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title="Dashboard" />
        <main className="flex-1 overflow-auto p-4 md:p-6 space-y-6 md:space-y-8">

          {/* Titre de bienvenue */}
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Bonjour 👋</h1>
            <p className="text-zinc-400 mt-1 text-sm">Voici l'état de votre parc applicatif</p>
          </div>

          {/* KPI Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <KPIWidget label="Total Apps" value="12" />
            <KPIWidget label="Versions actives" value="24" />
            <KPIWidget label="Téléchargements" value="45.2" unit="K" trend={{ value: 12, isPositive: true }} />
            <KPIWidget label="Taux de crash" value="0.02" unit="%" trend={{ value: 5, isPositive: false }} />
          </div>

          {/* Santé documentaire */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div className="bg-[#111111] border border-[#333333] rounded-lg p-4 md:p-5 hover:border-white transition">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="text-[#0070F3]" size={20} />
                <span className="text-zinc-400 text-sm">Santé documentaire</span>
              </div>
              <p className="text-2xl font-bold text-white">75%</p>
              <p className="text-xs text-zinc-500 mt-1">9/12 apps documentées</p>
            </div>

            <div className="bg-[#111111] border border-[#333333] rounded-lg p-4 md:p-5 hover:border-white transition">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="text-[#00CC88]" size={20} />
                <span className="text-zinc-400 text-sm">Répartition OS</span>
              </div>
              <p className="text-2xl font-bold text-white">iOS 60%</p>
              <p className="text-xs text-zinc-500 mt-1">Android 40%</p>
            </div>

            <div className="bg-[#111111] border border-[#333333] rounded-lg p-4 md:p-5 hover:border-white transition">
              <div className="flex items-center gap-3 mb-3">
                <Activity className="text-[#F5A623]" size={20} />
                <span className="text-zinc-400 text-sm">Status Monitor</span>
              </div>
              <p className="text-2xl font-bold text-[#00CC88]">● Opérationnel</p>
              <p className="text-xs text-zinc-500 mt-1">Tous les services actifs</p>
            </div>
          </div>

          {/* Timeline des dernières apps */}
          <div className="bg-[#111111] border border-[#333333] rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm md:text-base">Timeline des builds</h2>
              <Link href="/apps/new">
                <button className="px-3 py-1 bg-white text-black text-xs md:text-sm font-medium rounded-lg hover:bg-zinc-200 transition">
                  + Nouvelle app
                </button>
              </Link>
            </div>
            <div className="space-y-3">
              {[
                { name: 'MonApp iOS', version: 'v2.1.0', date: "Aujourd'hui", status: 'success' },
                { name: 'Dashboard Admin', version: 'v1.3.2', date: 'Hier', status: 'success' },
                { name: 'API Gateway', version: 'v3.0.1', date: 'Il y a 3 jours', status: 'warning' },
              ].map((app, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[#222222] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${app.status === 'success' ? 'bg-[#00CC88]' : 'bg-[#F5A623]'}`} />
                    <span className="text-white text-xs md:text-sm">{app.name}</span>
                    <span className="text-zinc-500 text-xs hidden sm:block">{app.version}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">{app.date}</span>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}