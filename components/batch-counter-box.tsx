'use client'

import { InfoRow } from '@/components/info-row'
import { useMachine } from '@/components/machine-provider'
import { totalProcessed } from '@/lib/machine'

export function BatchCounterBox() {
  const { counters } = useMachine()
  const total = totalProcessed(counters)
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold tracking-wide sm:text-base text-black uppercase">
        LIVE BATCH COUNTER
      </h2>
      <div className="border border-black px-4 py-2.5 bg-white">
        <InfoRow label="PID - 1 (Station 1)" value={counters.pid1} />
        <InfoRow label="PID - 2 (Station 2)" value={counters.pid2} />
        <InfoRow label="PID - 3 (Station 3)" value={counters.pid3} />
        <InfoRow label="Residual (Station 4)" value={counters.residual} />
      </div>
      <p className="text-xs sm:text-sm text-black">
        Total Processed: <span className="font-bold">{total}</span>
      </p>
    </section>
  )
}
