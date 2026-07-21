'use client'

import { ConsoleButton } from '@/components/console-button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = '[ CONFIRM ]',
  cancelText = '[ CANCEL ]',
  variant = 'warning',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold uppercase tracking-wider text-black mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-800 mb-6 font-mono leading-relaxed">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <ConsoleButton variant="secondary" onClick={onCancel}>
            {cancelText}
          </ConsoleButton>
          <ConsoleButton
            variant={variant === 'danger' ? 'destructive' : variant === 'warning' ? 'warning' : 'success'}
            onClick={onConfirm}
          >
            {confirmText}
          </ConsoleButton>
        </div>
      </div>
    </div>
  )
}
