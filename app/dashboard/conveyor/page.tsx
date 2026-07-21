'use client'

import { useRouter } from 'next/navigation'
import { ConsoleShell } from '@/components/console-shell'
import { ConsoleButton } from '@/components/console-button'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardBody } from '@/components/dashboard-body'
import { EndBatchButton } from '@/components/sync-button'
import { useMachine } from '@/components/machine-provider'

const STATUS_TEXT: Record<string, string> = {
  idle: 'Conveyor Idle',
  running: 'Conveyor Active',
  paused: 'Conveyor Paused',
}

const PHASES = [
  { id: 1, label: 'Phase 1: Fiber Detected at Entrance Ultrasonic' },
  { id: 2, label: 'Phase 2: Traveling to Core Scan Checkpoint' },
  { id: 3, label: 'Phase 3: Awaiting Structural Frame Alignment' },
  { id: 4, label: 'Phase 4: Sensor Optics Aligning (Motor Stopped)' },
  { id: 5, label: 'Phase 5: Running Fiber Metrics Scan (TCS3200 & 3-IR)' },
  { id: 6, label: 'Phase 6: PNS/BAFS 318:2021 Grading & Cloud Sync' },
]

function SensorPhases() {
  const { activePhase, conveyor } = useMachine()

  return (
    <div className="flex flex-col gap-0.5 text-xs sm:text-sm text-black mt-2">
      <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-1">
        LIVE SORTING SENSOR PHASES
      </h3>
      {PHASES.map((p) => {
        let statusText = 'WAIT'
        let statusStyle = 'text-gray-400 font-normal'

        if (conveyor === 'running') {
          if (p.id < activePhase) {
            statusText = 'DONE'
            statusStyle = 'text-gray-500 font-bold'
          } else if (p.id === activePhase) {
            statusText = 'ACTIVE'
            statusStyle = 'text-green-700 font-bold'
          }
        } else {
          if (p.id < 4) {
            statusText = 'DONE'
            statusStyle = 'text-gray-500 font-bold'
          } else if (p.id === 4) {
            statusText = 'ACTIVE'
            statusStyle = 'text-black font-bold'
          }
        }

        return (
          <div key={p.id} className="flex items-baseline justify-between gap-2">
            <span className="truncate">{p.label}</span>
            <span className={statusStyle}>[{statusText}]</span>
          </div>
        )
      })}
    </div>
  )
}

export default function ConveyorDashboard() {
  const router = useRouter()
  const {
    conveyor,
    startConveyor,
    pauseConveyor,
    stopConveyor,
  } = useMachine()

  const handleStop = () => {
    stopConveyor()
    router.push('/batch-summary')
  }

  return (
    <ConsoleShell>
      <DashboardHeader modeLabel="Conveyor Mode" />
      <div className="border-b border-black px-6 py-2 text-center text-sm font-bold sm:text-base bg-white text-black">
        Conveyor Duty Cycle Speed: 75%
      </div>
      <DashboardBody
        scanTitle="LIVE SCAN RESULT"
        scanStatus={STATUS_TEXT[conveyor]}
        scanFooter={<SensorPhases />}
      />
      <footer className="flex items-center gap-3 border-t border-black px-6 py-4 bg-white text-black">
        <ConsoleButton
          variant="success"
          onClick={startConveyor}
          disabled={conveyor === 'running'}
        >
          [ START ]
        </ConsoleButton>
        <ConsoleButton
          variant="warning"
          onClick={pauseConveyor}
          disabled={conveyor !== 'running'}
        >
          [ PAUSE ]
        </ConsoleButton>
        <ConsoleButton variant="destructive" onClick={handleStop}>
          [ STOP ]
        </ConsoleButton>
        <div className="ml-auto">
          <EndBatchButton />
        </div>
      </footer>
    </ConsoleShell>
  )
}
