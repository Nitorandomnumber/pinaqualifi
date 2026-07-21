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
  const { connection, isScanningHandheld, handheldPhase } = useMachine()
  const isConnected = connection === 'connected'

  if (isScanningHandheld) {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse flex-shrink-0" />
        <span className="font-bold">Scanning fiber sample...</span>
      </div>
    )
  }

  if (handheldPhase >= 5) {
    return (
      <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600 flex-shrink-0" />
        <span>Scan complete — place next sample when Blue LED turns ON</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm text-black">
      <span className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${isConnected ? 'bg-blue-600 animate-pulse' : 'bg-gray-400'}`} />
      <span className="truncate">
        {isConnected
          ? 'Waiting for Blue LED identifier — place fiber under TCS3200 / IR array'
          : 'Offline — waiting for ESP32 connection at ws://192.168.4.1/ws'}
      </span>
    </div>
  )
}

export default function HandheldDashboard() {
  return (
    <ConsoleShell>
      <DashboardHeader modeLabel="Handheld Mode" />
      <DashboardBody
        scanTitle="HANDHELD SCAN RESULT"
        scanFooter={<HandheldPhases />}
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
