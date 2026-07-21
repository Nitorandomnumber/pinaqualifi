'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandHeader } from '@/components/brand-header'
import { ConsoleShell } from '@/components/console-shell'
import { ConsoleButton } from '@/components/console-button'
import { InfoRow } from '@/components/info-row'
import { useMachine } from '@/components/machine-provider'
import { totalProcessed } from '@/lib/machine'
import { fetchPastRecords, type BastosLog } from '@/lib/supabase'
import { ConfirmModal } from '@/components/confirm-modal'

export default function BatchSummaryPage() {
  const router = useRouter()
  const { counters, resetBatch } = useMachine()
  const [pastRecords, setPastRecords] = useState<BastosLog[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [showConfirmNew, setShowConfirmNew] = useState(false)
  const total = totalProcessed(counters)

  // Load past records from Supabase on load
  useEffect(() => {
    let active = true
    fetchPastRecords(15).then((records) => {
      if (active) {
        setPastRecords(records)
        setLoadingRecords(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const startNew = () => {
    resetBatch()
    router.push('/mode-select')
  }

  return (
    <ConsoleShell>
      <BrandHeader />
      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 bg-white text-black overflow-hidden">
        {/* LEFT — Current Batch Summary */}
        <div className="flex flex-col justify-between border-b md:border-b-0 md:border-r border-black p-4 bg-white">
          <div className="flex flex-col gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-black pb-1">
              BATCH SORTING SUMMARY
            </h2>
            <div className="border border-black bg-white px-3 py-2">
              <InfoRow label="PID - 1 (Station 1)" value={counters.pid1} />
              <InfoRow label="PID - 2 (Station 2)" value={counters.pid2} />
              <InfoRow label="PID - 3 (Station 3)" value={counters.pid3} />
              <InfoRow label="Residual (Station 4)" value={counters.residual} />
              <div className="mt-1 border-t border-black pt-1">
                <InfoRow label="Total Processed" value={total} />
              </div>
            </div>
            <p className="text-[11px] italic text-gray-600">
              * Live batch saved to Supabase cloud DB by ESP32.
            </p>
          </div>

          <ConsoleButton
            variant="success"
            className="w-full py-1.5 text-xs font-bold mt-2"
            onClick={() => setShowConfirmNew(true)}
          >
            [ Start New Sorting Batch ]
          </ConsoleButton>
        </div>

        {/* RIGHT — Past Records from Supabase */}
        <div className="flex flex-col p-4 overflow-hidden bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black mb-2 border-b border-black pb-1">
            PAST LOGS (SUPABASE)
          </h2>
          {loadingRecords ? (
            <p className="text-xs text-gray-500 italic">Loading past logs...</p>
          ) : pastRecords.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No cloud logs found.</p>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black text-left text-[11px]">
                    <th className="py-1 px-1.5 font-bold">#</th>
                    <th className="py-1 px-1.5 font-bold">Grade</th>
                    <th className="py-1 px-1.5 font-bold">Score</th>
                    <th className="py-1 px-1.5 font-bold">Cleanliness</th>
                    <th className="py-1 px-1.5 font-bold text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pastRecords.map((rec, idx) => (
                    <tr
                      key={rec.id ?? idx}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="py-0.5 px-1.5 border-b border-gray-200 text-[11px]">{rec.id}</td>
                      <td className="py-0.5 px-1.5 border-b border-gray-200 font-bold text-[11px]">{rec.grade || '—'}</td>
                      <td className="py-0.5 px-1.5 border-b border-gray-200 text-[11px]">{rec.quality_score || '—'}</td>
                      <td className="py-0.5 px-1.5 border-b border-gray-200 text-[11px]">{rec.cleanliness || '—'}</td>
                      <td className="py-0.5 px-1.5 border-b border-gray-200 text-right whitespace-nowrap text-[10px]">
                        {rec.created_at
                          ? new Date(rec.created_at).toLocaleString('en-PH', {
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmNew}
        title="START NEW BATCH"
        message="Starting a new batch will reset current session counters to zero. Proceed?"
        confirmText="[ START NEW BATCH ]"
        cancelText="[ CANCEL ]"
        variant="warning"
        onConfirm={startNew}
        onCancel={() => setShowConfirmNew(false)}
      />
    </ConsoleShell>
  )
}
