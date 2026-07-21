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
  const { counters, resetBatch, sync } = useMachine()
  const [uploaded, setUploaded] = useState(false)
  const [pastRecords, setPastRecords] = useState<BastosLog[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const total = totalProcessed(counters)

  // Load past records from Supabase on load
  useEffect(() => {
    let active = true
    fetchPastRecords(20).then((records) => {
      if (active) {
        setPastRecords(records)
        setLoadingRecords(false)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const [showConfirmNew, setShowConfirmNew] = useState(false)

  const startNew = () => {
    resetBatch()
    router.push('/mode-select')
  }

  return (
    <ConsoleShell>
      <BrandHeader />
      <div className="flex flex-1 overflow-hidden bg-white text-black">
        {/* LEFT — Current Batch Summary */}
        <div className="flex flex-1 flex-col items-center justify-center gap-5 border-r border-black px-6 py-4">
          <p className="text-lg italic sm:text-xl text-black">
            {'{ Batch Sorting Completed! }'}
          </p>
          <div className="w-full max-w-xl border border-black bg-white px-6 py-5">
            <InfoRow label="PID - 1 (Station 1)" value={counters.pid1} />
            <InfoRow label="PID - 2 (Station 2)" value={counters.pid2} />
            <InfoRow label="PID - 3 (Station 3)" value={counters.pid3} />
            <InfoRow label="Residual (Station 4)" value={counters.residual} />
            <div className="mt-2 border-t border-black pt-2">
              <InfoRow label="Total Processed" value={total} />
            </div>
          </div>
          <p className="text-sm italic text-black">
            {'{ Logs stored directly in Supabase Database by ESP32 }'}
          </p>
          <ConsoleButton
            variant="success"
            className="w-full max-w-xl"
            onClick={() => setShowConfirmNew(true)}
          >
            [ Start New Sorting Batch ]
          </ConsoleButton>
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

        {/* RIGHT — Past Records from Supabase */}
        <div className="flex flex-1 flex-col px-4 py-4 overflow-hidden">
          <h2 className="text-sm font-bold uppercase tracking-wider text-black mb-3 border-b border-black pb-2">
            PAST RECORDS — bastos_logs
          </h2>
          {loadingRecords ? (
            <p className="text-sm text-gray-500 italic">Loading records from Supabase...</p>
          ) : pastRecords.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No records found. Connect to internet to fetch.</p>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black text-left">
                    <th className="py-1.5 px-2 font-bold">#</th>
                    <th className="py-1.5 px-2 font-bold">Grade</th>
                    <th className="py-1.5 px-2 font-bold">Score</th>
                    <th className="py-1.5 px-2 font-bold">Cleanliness</th>
                    <th className="py-1.5 px-2 font-bold">R</th>
                    <th className="py-1.5 px-2 font-bold">G</th>
                    <th className="py-1.5 px-2 font-bold">B</th>
                    <th className="py-1.5 px-2 font-bold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pastRecords.map((rec, idx) => (
                    <tr
                      key={rec.id ?? idx}
                      className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    >
                      <td className="py-1 px-2 border-b border-gray-200">{rec.id}</td>
                      <td className="py-1 px-2 border-b border-gray-200 font-bold">{rec.grade || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200">{rec.quality_score || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200">{rec.cleanliness || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200">{rec.red_val || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200">{rec.green_val || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200">{rec.blue_val || '—'}</td>
                      <td className="py-1 px-2 border-b border-gray-200 whitespace-nowrap">
                        {rec.created_at
                          ? new Date(rec.created_at).toLocaleString('en-PH', {
                              month: 'short',
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
    </ConsoleShell>
  )
}
