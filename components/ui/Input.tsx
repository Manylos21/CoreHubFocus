import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder:text-[#888888]',
            'focus:outline-none focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[#FF0000] focus:border-[#FF0000] focus:ring-[#FF0000]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-[#FF0000]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
