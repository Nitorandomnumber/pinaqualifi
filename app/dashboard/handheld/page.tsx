'use client'

import { ConsoleShell } from '@/components/console-shell'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardBody } from '@/components/dashboard-body'
import { EndBatchButton } from '@/components/sync-button'
import { useMachine } from '@/components/machine-provider'
import { HANDHELD_PHASES } from '@/lib/machine'

function HandheldPhases() {
  const { handheldPhase, isScanningHandheld } = useMachine()

  return (
    <div className="flex flex-col gap-0.5 text-xs text-black mt-1.5">
      <h3 className="font-bold text-xs uppercase tracking-wider text-black mb-0.5">
        HANDHELD SCANNING PHASES
      </h3>
      {HANDHELD_PHASES.map((p) => {
        let statusText = 'WAIT'
        let statusStyle = 'text-gray-400 font-normal'

        if (handheldPhase > 0) {
          if (p.id < handheldPhase) {
            statusText = 'DONE'
            statusStyle = 'text-gray-500 font-bold'
          } else if (p.id === handheldPhase) {
            statusText = isScanningHandheld ? 'ACTIVE' : 'DONE'
            statusStyle = isScanningHandheld
              ? 'text-green-700 font-bold'
              : 'text-gray-500 font-bold'
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

function IdentifierStatus() {
  const { connection, isScanningHandheld, scannerState, handheldPhase } = useMachine()
  const isConnected = connection === 'connected'

  if (scannerState === 'paused') {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse flex-shrink-0" />
        <span className="font-bold text-yellow-700">
          Scanner PAUSED — Press scanner button to RESUME or tap [ END BATCH ]
        </span>
      </div>
    )
  }

  if (isScanningHandheld || scannerState === 'scanning') {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse flex-shrink-0" />
        <span className="font-bold">Scanning active — press scanner button to PAUSE</span>
      </div>
    )
  }

  if (handheldPhase >= 5) {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600 flex-shrink-0" />
        <span>Scan complete — press scanner button for next sample</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
      <span className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-blue-600 animate-pulse' : 'bg-gray-400'}`} />
      <span className="truncate">
        {isConnected
          ? 'Press scanner button to START scanning | Blue LED active'
          : 'Offline — waiting for ESP32 connection'}
      </span>
    </div>
  )
}

export default function HandheldDashboard() {
  const { triggerScan, connection } = useMachine()
  const isConnected = connection === 'connected'

  return (
    <ConsoleShell>
      <DashboardHeader modeLabel="Handheld Mode" />
      <DashboardBody
        scanTitle="HANDHELD SCAN RESULT"
        scanFooter={
          <div className="flex flex-col gap-3">
            <button
              onClick={triggerScan}
              disabled={!isConnected}
              className="w-full py-2.5 text-xs sm:text-sm font-bold uppercase border-2 border-black bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
            >
              [ Run Optical Scan Now ]
            </button>
            <HandheldPhases />
          </div>
        }
      />
      <footer className="flex items-center gap-2 border-t border-black px-4 py-2 bg-white text-black">
        <IdentifierStatus />
        <div className="ml-auto flex-shrink-0">
          <EndBatchButton />
        </div>
      </footer>
    </ConsoleShell>
  )
}
