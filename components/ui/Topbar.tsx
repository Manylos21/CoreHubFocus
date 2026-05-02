'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AppLogo } from './AppLogo'
import { Bell, Search, Plus, LogOut } from 'lucide-react'
import { Button } from './Button'

export interface TopbarProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  showSearch?: boolean
  showNewAppButton?: boolean
}

const Topbar = forwardRef<HTMLDivElement, TopbarProps>(
  ({ className, title, showSearch = true, showNewAppButton = false, ...props }, ref) => {
    const router = useRouter()

    const handleLogout = async () => {
      await fetch('/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    }

    return (
      <div
        ref={ref}
        className={cn(
          'h-16 bg-[#111111] border-b border-[#333333] flex items-center justify-between px-6',
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4">
          <AppLogo size="sm" showText={false} />
          {title && (
            <h1 className="text-lg font-semibold text-white">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-4">
          {showSearch && (
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" 
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Search..."
                className="bg-[#000000] border border-[#333333] rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-[#888888] focus:outline-none focus:border-[#0070F3] w-64"
              />
            </div>
          )}

          {showNewAppButton && (
            <Link href="/apps/new">
              <Button variant="primary" size="sm">
                <Plus size={16} className="mr-2" />
                Nouvelle App
              </Button>
            </Link>
          )}

          <button className="relative p-2 text-[#888888] hover:text-white transition-colors">
            <Bell size={18} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF0000] rounded-full" />
          </button>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-[#888888] hover:text-white transition-colors"
            title="Sign out"
          >
            <LogOut size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    )
  }
)

Topbar.displayName = 'Topbar'

export { Topbar }
