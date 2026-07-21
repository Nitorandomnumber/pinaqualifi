'use client'

import { useMachine } from '@/components/machine-provider'

export function ConnectionStatus() {
  const { connection, reconnect } = useMachine()

  if (connection === 'connected') {
    return (
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-green-700">
        <span className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
        <span>ESP32 ONLINE</span>
      </div>
    )
  }

  if (connection === 'connecting') {
    return (
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-yellow-600">
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
        <span>CONNECTING...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <div className="flex items-center gap-1.5 font-bold text-red-600">
        <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
        <span>ESP32 OFFLINE</span>
      </div>
      <button
        onClick={reconnect}
        className="px-2 py-0.5 text-[11px] font-bold border border-black bg-white text-black hover:bg-gray-100 uppercase"
        title="Retry connection to ESP32"
      >
        [ Retry ]
      </button>
    </div>
  )
}
