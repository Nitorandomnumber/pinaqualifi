'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConsoleButton } from '@/components/console-button'
import { ConfirmModal } from '@/components/confirm-modal'
import { FullscreenToggle } from '@/components/fullscreen-toggle'
import { useMachine } from '@/components/machine-provider'

export function DashboardHeader({ modeLabel }: { modeLabel: string }) {
  const router = useRouter()
  const { setMode } = useMachine()
  const [time, setTime] = useState('21:42:05')
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false)

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }),
      )
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const handleSwitchMode = () => {
    setShowConfirmSwitch(false)
    setMode(null)
    router.push('/mode-select')
  }

  return (
    <>
      <header className="grid grid-cols-3 items-center border-b border-black px-6 py-3 bg-white text-black">
        <span className="text-base sm:text-lg">Time: {time}</span>
        <span className="text-center text-base font-bold sm:text-lg">
          Mode: {modeLabel}
        </span>
        <div className="flex justify-end gap-3 items-center">
          <FullscreenToggle />
          <ConsoleButton
            variant="success"
            onClick={() => setShowConfirmSwitch(true)}
          >
            [ Switch Mode ]
          </ConsoleButton>
        </div>
      </header>

      <ConfirmModal
        isOpen={showConfirmSwitch}
        title="SWITCH MODE CONFIRMATION"
        message="Are you sure you want to exit the current mode? Current live session will end."
        confirmText="[ SWITCH MODE ]"
        cancelText="[ STAY HERE ]"
        variant="warning"
        onConfirm={handleSwitchMode}
        onCancel={() => setShowConfirmSwitch(false)}
      />
    </>
  )
}
