'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AppLogo } from './AppLogo'
import { 
  LayoutDashboard, 
  Smartphone, 
  FileText, 
  Hammer, 
  Settings, 
  LogOut,
  type LucideIcon 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface SidebarItem {
  label: string
  icon: LucideIcon
  href: string
  active?: boolean
}

export interface SidebarProps extends HTMLAttributes<HTMLDivElement> {
  items?: SidebarItem[]
  currentPath?: string
}

const defaultItems: SidebarItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Applications', icon: Smartphone, href: '/apps' },
  { label: 'Documentation', icon: FileText, href: '/documentation' },
  { label: 'Builds', icon: Hammer, href: '/builds' },
  { label: 'Settings', icon: Settings, href: '/settings' },
]

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, items = defaultItems, currentPath, ...props }, ref) => {
    const router = useRouter()

    const handleLogout = async () => {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    }

    return (
      <div
        ref={ref}
        className={cn(
          'w-64 bg-[#111111] border-r border-[#333333] flex flex-col h-screen',
          className
        )}
        {...props}
      >
        <div className="p-6 border-b border-[#333333]">
          <AppLogo size="md" />
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => {
            const isActive = currentPath === item.href || item.active
            const Icon = item.icon
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#0070F3]/10 text-[#0070F3]'
                    : 'text-[#888888] hover:text-white hover:bg-[#1a1a1a]'
                )}
              >
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#333333]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-colors w-full"
          >
            <LogOut size={18} strokeWidth={1.5} />
            Logout
          </button>
        </div>
      </div>
    )
  }
)

Sidebar.displayName = 'Sidebar'

export { Sidebar }
