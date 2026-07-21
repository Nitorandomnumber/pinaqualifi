'use client'

import { useMachine } from '@/components/machine-provider'

const LABELS: Record<string, string> = {
  connecting: '----',
  connected: 'OPERATING LOCAL AP',
  offline: 'OPERATING LOCAL AP',
}

export function ConnectionStatus() {
  const { connection } = useMachine()
  return (
    <span className="text-base sm:text-lg">
      Status:{' '}
      <span
        className={
          connection === 'connecting'
            ? 'font-bold text-gray-500'
            : 'font-bold text-black'
        }
      >
        {LABELS[connection]}
      </span>
    </span>
  )
}
