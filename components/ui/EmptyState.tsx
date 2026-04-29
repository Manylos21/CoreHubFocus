import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}
        {...props}
      >
        {Icon && (
          <div className="mb-4 text-[#333333]">
            <Icon size={48} strokeWidth={1.5} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        {description && (
          <p className="text-sm text-[#888888] mb-6 max-w-md">{description}</p>
        )}
        {action && (
          <button
            onClick={action.onClick}
            className="px-4 py-2 bg-[#0070F3] text-white rounded-lg text-sm font-medium hover:bg-[#0056b3] transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

export { EmptyState }
