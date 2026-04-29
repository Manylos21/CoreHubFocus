import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-white">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'bg-[#111111] border border-[#333333] rounded-lg px-3 py-2 text-white placeholder:text-[#888888]',
            'focus:outline-none focus:border-[#0070F3] focus:ring-1 focus:ring-[#0070F3]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y min-h-[80px]',
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

Textarea.displayName = 'Textarea'

export { Textarea }
