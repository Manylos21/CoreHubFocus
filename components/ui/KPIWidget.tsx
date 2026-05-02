import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface KPIWidgetProps extends HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  unit?: string
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const KPIWidget = forwardRef<HTMLDivElement, KPIWidgetProps>(
  ({ className, label, value, unit, description, trend, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-[#111111] border border-[#333333] rounded-lg p-6', className)}
        {...props}
      >
        <p className="text-sm text-[#888888] mb-2">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white font-mono">{value}</span>
          {unit && <span className="text-sm text-[#888888]">{unit}</span>}
        </div>
        {description && (
          <p className="text-xs text-[#666666] mt-1">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            <span
              className={cn(
                'text-sm font-medium',
                trend.isPositive ? 'text-[#00CC88]' : 'text-[#FF0000]'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-sm text-[#888888]">vs last period</span>
          </div>
        )}
      </div>
    )
  }
)

KPIWidget.displayName = 'KPIWidget'

export { KPIWidget }
