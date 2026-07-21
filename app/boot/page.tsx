'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandHeader } from '@/components/brand-header'
import { ConsoleShell } from '@/components/console-shell'
import { ConsoleButton } from '@/components/console-button'
import { InfoRow } from '@/components/info-row'
import { useMachine } from '@/components/machine-provider'

const CHECKS = [
  'Color Sensor (TCS3200)',
  'Entrance Ultrasonic & IR Array',
  'Actuators & 12V Conveyor Relays',
]

function BootContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { mode: contextMode, connection, sensorCheck, sendCommand } = useMachine()
  const activeMode = searchParams.get('mode') || contextMode || 'conveyor'
  const isHandheld = activeMode === 'handheld'

  const [ready, setReady] = useState<boolean[]>([false, false, false])

  // Request live diagnostic check from ESP32 on mount and connection
  useEffect(() => {
    if (connection === 'connected') {
      sendCommand('CHECK_SENSORS')
    }
  }, [connection, sendCommand])

  // Update live sensor states strictly from ESP32 responses
  useEffect(() => {
    if (sensorCheck) {
      setReady([sensorCheck.color, sensorCheck.ir, sensorCheck.relays])
    }
  }, [sensorCheck])

  // In Handheld mode, Actuators & 12V Relays are off-scope / bypassed on battery
  const allDone = ready[0] && ready[1] && (isHandheld || ready[2])

  const handleProceed = () => {
    if (isHandheld) {
      router.push('/dashboard/handheld')
    } else {
      router.push('/dashboard/conveyor')
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-4 sm:py-6 bg-white text-black overflow-y-auto">
      <p className="text-base italic sm:text-xl text-black">
        {'{ Checking live hardware sensors... }'}
      </p>
      <div className="w-full max-w-xl border border-black bg-white px-5 py-4">
        <InfoRow
          label={CHECKS[0]}
          value={
            connection !== 'connected' ? (
              <span className="text-red-600 font-bold">ESP32 Offline</span>
            ) : ready[0] ? (
              <span className="text-green-700 font-bold">Ready</span>
            ) : (
              <span className="text-red-600 font-bold">Not Found / Unplugged</span>
            )
          }
        />
        <InfoRow
          label={CHECKS[1]}
          value={
            connection !== 'connected' ? (
              <span className="text-red-600 font-bold">ESP32 Offline</span>
            ) : ready[1] ? (
              <span className="text-green-700 font-bold">Ready</span>
            ) : (
              <span className="text-red-600 font-bold">Not Found / Unplugged</span>
            )
          }
        />
        <InfoRow
          label={CHECKS[2]}
          value={
            isHandheld ? (
              <span className="text-gray-500 font-bold">Disabled (Bypassed)</span>
            ) : connection !== 'connected' ? (
              <span className="text-red-600 font-bold">ESP32 Offline</span>
            ) : ready[2] ? (
              <span className="text-green-700 font-bold">Ready</span>
            ) : (
              <span className="text-red-600 font-bold">Not Found</span>
            )
          }
        />
      </div>
      <ConsoleButton
        variant="success"
        className="w-full max-w-xl"
        disabled={!allDone}
        onClick={handleProceed}
      >
        [ Proceed ]
      </ConsoleButton>
    </div>
  )
}

export default function BootPage() {
  return (
    <ConsoleShell>
      <BrandHeader />
      <Suspense fallback={<div className="flex-1 bg-white" />}>
        <BootContent />
      </Suspense>
    </ConsoleShell>
  )
}
