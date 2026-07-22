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
        <span className="font-bold">
          {isScanningHandheld
            ? 'Analyzing fiber sample... Please hold still'
            : 'Preparing next scan — Position next fiber sample | Press button to PAUSE'}
        </span>
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
  const { 
    triggerScan, 
    connection, 
    scannerState, 
    isScanningHandheld, 
    handheldPhase, 
    toggleScannerPause 
  } = useMachine()
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

      {/* ⚠️ HIGH-VISIBILITY PAUSE OVERLAY */}
      {scannerState === 'paused' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border-4 border-yellow-500 bg-white p-6 shadow-2xl text-center flex flex-col gap-4 text-black">
            <div className="bg-yellow-500 text-black py-1 font-bold uppercase tracking-wider text-xs sm:text-sm">
              ⚠️ SCANNING PAUSED
            </div>
            <p className="text-xs text-gray-700 font-bold uppercase">
              The optical scan sequence has been paused.
            </p>
            <button
              onClick={toggleScannerPause}
              className="w-full py-2 text-xs font-bold border-2 border-black bg-black text-white hover:bg-gray-900 uppercase tracking-wide"
            >
              [ Resume Scanning ]
            </button>
          </div>
        </div>
      )}

      {/* 🟢 HIGH-VISIBILITY ACTIVE SCAN OVERLAY */}
      {isScanningHandheld && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border-4 border-green-600 bg-white p-6 shadow-2xl text-center flex flex-col gap-4 text-black">
            <div className="bg-green-600 text-white py-1 font-bold uppercase tracking-wider text-xs sm:text-sm animate-pulse">
              🔍 OPTICAL SCAN IN PROGRESS
            </div>
            <div className="text-[11px] sm:text-xs text-gray-800 font-bold uppercase border border-black p-3 bg-gray-50 flex flex-col gap-1.5">
              <span>Active Phase:</span>
              <span className="text-xs sm:text-sm text-green-700 font-mono">
                {HANDHELD_PHASES.find(p => p.id === handheldPhase)?.label || "Analyzing..."}
              </span>
            </div>
            <button
              onClick={toggleScannerPause}
              className="w-full py-2 text-xs font-bold border-2 border-black bg-yellow-500 text-black hover:bg-yellow-600 uppercase tracking-wide"
            >
              [ Pause Scan ]
            </button>
          </div>
        </div>
      )}

      <footer className="flex items-center gap-2 border-t border-black px-4 py-2 bg-white text-black">
        <IdentifierStatus />
        <div className="ml-auto flex-shrink-0">
          <EndBatchButton />
        </div>
      </footer>
    </ConsoleShell>
  )
}
