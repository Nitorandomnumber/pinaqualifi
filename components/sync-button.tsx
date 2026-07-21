'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConsoleButton } from '@/components/console-button'
import { ConfirmModal } from '@/components/confirm-modal'

export function EndBatchButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirm = () => {
    setShowConfirm(false)
    router.push('/batch-summary')
  }

  return (
    <>
      <ConsoleButton variant="info" onClick={() => setShowConfirm(true)}>
        [ END BATCH ]
      </ConsoleButton>

      <ConfirmModal
        isOpen={showConfirm}
        title="END BATCH CONFIRMATION"
        message="Are you sure you want to end the current sorting batch? This will summarize your session counts."
        confirmText="[ YES, END BATCH ]"
        cancelText="[ RETURN ]"
        variant="warning"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
