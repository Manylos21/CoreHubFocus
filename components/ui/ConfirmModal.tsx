import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

export interface ConfirmModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'default'
}

const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(
  ({
    className,
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    ...props
  }, ref) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            'relative bg-[#111111] border border-[#333333] rounded-lg p-6 max-w-md w-full mx-4',
            className
          )}
          {...props}
        >
          <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-[#888888] mb-6">{description}</p>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={onClose}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

ConfirmModal.displayName = 'ConfirmModal'

export { ConfirmModal }
