import { HTMLAttributes, forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from './Badge'
import { StatusDot } from './StatusDot'
import { Smartphone, ExternalLink, FileText, Clock } from 'lucide-react'

export interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  name: string
  description: string
  version: string
  os: 'iOS' | 'Android' | 'Cross-platform'
  techStack: string[]
  status: 'Active' | 'Archived' | 'Maintenance'
  documentationStatus: 'Complete' | 'Missing'
  lastBuild: string
  href?: string
}

const AppCard = forwardRef<HTMLDivElement, AppCardProps>(
  ({ className, name, description, version, os, techStack, status, documentationStatus, lastBuild, href = '#', ...props }, ref) => {
    const getOSBadge = (os: string) => {
      const variants: Record<string, 'default' | 'success' | 'warning'> = {
        'iOS': 'default',
        'Android': 'success',
        'Cross-platform': 'warning',
      }
      return <Badge variant={variants[os] || 'default'}>{os}</Badge>
    }

    const getStatusBadge = (status: string) => {
      const variants: Record<string, 'success' | 'default' | 'warning'> = {
        'Active': 'success',
        'Archived': 'default',
        'Maintenance': 'warning',
      }
      return <Badge variant={variants[status] || 'default'}>{status}</Badge>
    }

    const getDocStatus = (status: string) => {
      if (status === 'Complete') {
        return (
          <div className="flex items-center gap-1.5">
            <FileText size={14} className="text-[#00CC88]" />
            <span className="text-sm text-[#00CC88]">Complete</span>
          </div>
        )
      }
      return (
        <div className="flex items-center gap-1.5">
          <FileText size={14} className="text-[#FF0000]" />
          <span className="text-sm text-[#FF0000]">Missing</span>
        </div>
      )
    }

    return (
      <Link href={href}>
        <div
          ref={ref}
          className={cn(
            'bg-[#111111] border border-[#333333] rounded-lg p-5 hover:border-[#0070F3] transition-colors cursor-pointer',
            className
          )}
          {...props}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#222222] flex items-center justify-center">
                <Smartphone size={20} className="text-[#888888]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">{name}</h3>
                <p className="text-sm text-[#888888]">v{version}</p>
              </div>
            </div>
            {getStatusBadge(status)}
          </div>

          <p className="text-sm text-[#888888] mb-4 line-clamp-2">{description}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {getOSBadge(os)}
            {techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-[#222222] text-[#888888] rounded text-xs"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#333333]">
            {getDocStatus(documentationStatus)}
            <div className="flex items-center gap-1.5 text-xs text-[#888888]">
              <Clock size={14} />
              <span>{lastBuild}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }
)

AppCard.displayName = 'AppCard'

export { AppCard }
