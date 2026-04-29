import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  status: 'online' | 'offline' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}

const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, status, size = 'md', ...props }, ref) => {
    const colors = {
      online: 'bg-[#00CC88]',
      offline: 'bg-[#888888]',
      warning: 'bg-[#F5A623]',
      error: 'bg-[#FF0000]'
    }
    
    const sizes = {
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3'
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-block rounded-full',
          colors[status],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

StatusDot.displayName = 'StatusDot'

export { StatusDot }
