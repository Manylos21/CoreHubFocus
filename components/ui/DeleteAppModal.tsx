import { useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'

export interface DeleteAppModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  appName: string
}

export function DeleteAppModal({ isOpen, onClose, onConfirm, appName }: DeleteAppModalProps) {
  const [confirmationText, setConfirmationText] = useState('')
  const [error, setError] = useState('')

  const isConfirmed = confirmationText.trim() === appName.trim()

  const handleConfirm = () => {
    if (!isConfirmed) {
      setError('Please type the application name correctly to confirm deletion')
      return
    }
    setError('')
    onConfirm()
  }

  const handleClose = () => {
    setConfirmationText('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-[#111111] border border-[#333333] rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-2">Delete Application</h3>
        <p className="text-sm text-[#888888] mb-4">
          Are you sure you want to delete <span className="text-white font-medium">"{appName}"</span>? 
          This action cannot be undone.
        </p>
        <p className="text-sm text-[#FF0000] mb-4">
          This will permanently delete the application and all associated data (documents, KPIs, logs).
        </p>
        
        <div className="mb-4">
          <p className="text-sm text-[#888888] mb-2">
            Type the application name to confirm:
          </p>
          <Input
            placeholder={appName}
            value={confirmationText}
            onChange={(e) => {
              setConfirmationText(e.target.value)
              setError('')
            }}
            error={error}
          />
        </div>

        {error && (
          <div className="text-sm text-[#FF0000] bg-[#FF0000]/10 border border-[#FF0000]/20 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!isConfirmed}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
