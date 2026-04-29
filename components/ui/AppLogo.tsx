import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Layers } from 'lucide-react'

export interface AppLogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

const AppLogo = forwardRef<HTMLDivElement, AppLogoProps>(
  ({ className, size = 'md', showText = true, ...props }, ref) => {
    const sizes = {
      sm: { icon: 20, text: 'text-sm' },
      md: { icon: 24, text: 'text-base' },
      lg: { icon: 32, text: 'text-xl' }
    }

    const { icon, text } = sizes[size]

    return (
      <div
        ref={ref}
        className={cn('flex items-center gap-2', className)}
        {...props}
      >
        <div className="flex items-center justify-center w-8 h-8 bg-[#0070F3] rounded-lg">
          <Layers size={icon} className="text-white" strokeWidth={1.5} />
        </div>
        {showText && (
          <span className={cn('font-bold text-white', text)}>CoreHubFocus</span>
        )}
      </div>
    )
  }
)

AppLogo.displayName = 'AppLogo'

export { AppLogo }
