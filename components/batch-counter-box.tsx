'use client'

import { InfoRow } from '@/components/info-row'
import { useMachine } from '@/components/machine-provider'
import { totalProcessed } from '@/lib/machine'

export function BatchCounterBox() {
  const { counters, pendingSync } = useMachine()
  const total = totalProcessed(counters)
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-bold tracking-wide sm:text-xl">
        LIVE BATCH COUNTER
      </h2>
      <div className="border border-black px-5 py-4 bg-white">
        <InfoRow label="PID - 1 (Station 1)" value={counters.pid1} />
        <InfoRow label="PID - 2 (Station 2)" value={counters.pid2} />
        <InfoRow label="PID - 3 (Station 3)" value={counters.pid3} />
        <InfoRow label="Residual (Station 4)" value={counters.residual} />
      </div>
      <p className="text-base sm:text-lg">
        Total Processed: {total} | Stored Offline: {pendingSync} Samples
      </p>
    </section>
  )
}
