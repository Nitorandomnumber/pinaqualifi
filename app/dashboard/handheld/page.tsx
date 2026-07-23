'use client'

import { useState } from 'react'
import { ConsoleShell } from '@/components/console-shell'
import { DashboardHeader } from '@/components/dashboard-header'
import { DashboardBody } from '@/components/dashboard-body'
import { EndBatchButton } from '@/components/sync-button'
import { useMachine } from '@/components/machine-provider'
import { HANDHELD_PHASES, formatCleanliness, formatTexture } from '@/lib/machine'

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
  const [selectedTarget, setSelectedTarget] = useState<'PID1' | 'PID2' | 'PID3' | 'RESIDUAL'>('PID1')
  const { 
    triggerScan, 
    connection, 
    scannerState, 
    isScanningHandheld, 
    handheldPhase, 
    toggleScannerPause,
    isCalibrating,
    calibrationProgress,
    startCalibration,
    scan
  } = useMachine()
  const isConnected = connection === 'connected'

  return (
    <ConsoleShell>
      <DashboardHeader modeLabel="Handheld Mode" />
      <DashboardBody
        scanTitle="HANDHELD SCAN RESULT"
        scanFooter={
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <button
                onClick={triggerScan}
                disabled={!isConnected || isCalibrating}
                className="w-full py-2.5 text-xs sm:text-sm font-bold uppercase border-2 border-black bg-green-700 text-white hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
              >
                [ Run Optical Scan Now ]
              </button>

              <div className="flex flex-col gap-1.5 p-2 border border-black bg-gray-50 text-black">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700">
                  Select Target to Calibrate (60s):
                </span>
                <div className="grid grid-cols-4 gap-1">
                  {(['PID1', 'PID2', 'PID3', 'RESIDUAL'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTarget(t)}
                      className={`py-1 text-[9px] sm:text-xs font-bold border transition-colors ${selectedTarget === t ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`}
                    >
                      {t === 'RESIDUAL' ? 'RESID' : t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => startCalibration(selectedTarget)}
                  disabled={!isConnected || scannerState === 'scanning' || isCalibrating}
                  className="w-full py-2 text-xs font-bold uppercase border border-black bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                >
                  [ Start Calibration for {selectedTarget} ]
                </button>
              </div>
            </div>
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

      {/* 🔄 READY FOR NEXT SAMPLE OVERLAY (BETWEEN SCANS) */}
      {scannerState === 'scanning' && !isScanningHandheld && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border-4 border-blue-600 bg-white p-6 shadow-2xl text-center flex flex-col gap-4 text-black">
            <div className="bg-blue-600 text-white py-1 font-bold uppercase tracking-wider text-xs sm:text-sm animate-pulse">
              🔄 READY FOR NEXT FIBER SAMPLE
            </div>

            {/* 📊 LATEST SCAN RESULT SUMMARY CARD */}
            {scan.grade !== '----' && (
              <div className="border border-black p-3 bg-gray-50 text-left flex flex-col gap-1 text-xs">
                <span className="font-bold uppercase text-gray-500 text-[10px] tracking-wider mb-1 block">
                  LATEST SCANNED RESULT:
                </span>
                <div className="flex justify-between border-b border-gray-200 py-0.5 font-mono">
                  <span className="font-bold text-gray-700 font-sans">Grade:</span>
                  <span className="text-blue-700 font-extrabold">{scan.grade}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-0.5 font-mono">
                  <span className="font-bold text-gray-700 font-sans">Score:</span>
                  <span>{scan.score}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-0.5 font-mono">
                  <span className="font-bold text-gray-700 font-sans">Cleanliness:</span>
                  <span>{formatCleanliness(scan.cleanliness)}</span>
                </div>
                <div className="flex justify-between py-0.5 font-mono">
                  <span className="font-bold text-gray-700 font-sans">Texture:</span>
                  <span>{formatTexture(scan.texture)}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-700 font-bold uppercase">
              Please position the next fiber sample under the color sensor.
            </p>
            <div className="text-[10px] text-gray-500 italic uppercase">
              Next scan will trigger automatically in a few seconds...
            </div>
            <button
              onClick={toggleScannerPause}
              className="w-full py-2 text-xs font-bold border-2 border-black bg-yellow-500 text-black hover:bg-yellow-600 uppercase tracking-wide"
            >
              [ Pause Scanner ]
            </button>
          </div>
        </div>
      )}

      {/* ⚙️ HIGH-VISIBILITY CALIBRATION OVERLAY */}
      {isCalibrating && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border-4 border-blue-600 bg-white p-6 shadow-2xl text-center flex flex-col gap-4 text-black">
            <div className="bg-blue-600 text-white py-1 font-bold uppercase tracking-wider text-xs sm:text-sm animate-pulse">
              ⚙️ SENSOR CALIBRATION IN PROGRESS
            </div>
            <p className="text-xs text-gray-700 font-bold uppercase">
              Please position your PID-1 reference sample under the sensor lens.
            </p>
            <div className="flex flex-col gap-2">
              <div className="w-full bg-gray-200 border border-black h-4 overflow-hidden relative">
                <div 
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${calibrationProgress}%` }}
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-black mix-blend-difference font-mono">
                  {calibrationProgress}%
                </span>
              </div>
              <span className="text-[10px] text-gray-500 italic uppercase">
                Calibrating RGB color channels...
              </span>
            </div>
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
