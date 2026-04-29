import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#111111] text-white border border-[#333333]',
      success: 'bg-[#00CC88]/10 text-[#00CC88] border border-[#00CC88]/20',
      danger: 'bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20',
      warning: 'bg-[#F5A623]/10 text-[#F5A623] border border-[#F5A623]/20'
    }
    
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
