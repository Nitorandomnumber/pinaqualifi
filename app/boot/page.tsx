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
  const { mode: contextMode } = useMachine()
  const activeMode = searchParams.get('mode') || contextMode || 'conveyor'
  const isHandheld = activeMode === 'handheld'

  const [ready, setReady] = useState<boolean[]>(CHECKS.map(() => false))

  useEffect(() => {
    const timers = CHECKS.map((_, i) =>
      setTimeout(
        () => setReady((prev) => prev.map((v, idx) => (idx === i ? true : v))),
        400 + i * 500,
      ),
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // In Handheld mode, Actuators & 12V Relays are off-scope / bypassed on battery
  const allDone = ready[0] && ready[1] && ready[2]

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
        {'{ Checking sensors and motor relays... }'}
      </p>
      <div className="w-full max-w-xl border border-black bg-white px-5 py-4">
        <InfoRow
          label={CHECKS[0]}
          value={
            <span className={ready[0] ? 'text-green-700 font-bold' : 'text-gray-500'}>
              {ready[0] ? 'Ready' : '...'}
            </span>
          }
        />
        <InfoRow
          label={CHECKS[1]}
          value={
            <span className={ready[1] ? 'text-green-700 font-bold' : 'text-gray-500'}>
              {ready[1] ? 'Ready' : '...'}
            </span>
          }
        />
        <InfoRow
          label={CHECKS[2]}
          value={
            ready[2] ? (
              isHandheld ? (
                <span className="text-gray-500 font-bold">Disabled (Bypassed)</span>
              ) : (
                <span className="text-green-700 font-bold">Ready</span>
              )
            ) : (
              <span className="text-gray-500">...</span>
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
