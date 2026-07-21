'use client'

import { useState } from 'react'
import { useMachine } from '@/components/machine-provider'

export function ConnectionStatus() {
  const { connection, reconnect, wsIp, setWsIp } = useMachine()
  const [showPrompt, setShowPrompt] = useState(false)
  const [inputIp, setInputIp] = useState(wsIp)

  const handleSaveIp = (e: React.FormEvent) => {
    e.preventDefault()
    setWsIp(inputIp)
    setShowPrompt(false)
  }

  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      {connection === 'connected' ? (
        <div className="flex items-center gap-1.5 font-bold text-green-700">
          <span className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
          <span>ESP32 ONLINE</span>
        </div>
      ) : connection === 'connecting' ? (
        <div className="flex items-center gap-1.5 font-bold text-yellow-600">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500 animate-pulse" />
          <span>CONNECTING ({wsIp})...</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 font-bold text-red-600">
          <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
          <span>ESP32 OFFLINE</span>
        </div>
      )}

      {connection !== 'connected' && (
        <button
          onClick={reconnect}
          className="px-2 py-0.5 text-[11px] font-bold border border-black bg-white text-black hover:bg-gray-100 uppercase"
          title="Retry connection"
        >
          [ Retry ]
        </button>
      )}

      <button
        onClick={() => {
          setInputIp(wsIp)
          setShowPrompt(true)
        }}
        className="px-1.5 py-0.5 text-[11px] font-bold border border-gray-400 bg-white text-gray-700 hover:bg-gray-100 uppercase"
        title="Config ESP32 IP address"
      >
        ⚙ IP
      </button>

      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSaveIp}
            className="w-full max-w-xs border-2 border-black bg-white p-4 shadow-xl flex flex-col gap-3 text-black"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Config ESP32 IP Address
            </h3>
            <p className="text-xs text-gray-600">
              Enter the IP address printed in your ESP32 Serial Monitor:
            </p>
            <input
              type="text"
              value={inputIp}
              onChange={(e) => setInputIp(e.target.value)}
              placeholder="e.g. 192.168.1.15"
              className="border border-black px-3 py-1.5 text-sm font-mono w-full bg-white text-black"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowPrompt(false)}
                className="px-3 py-1 text-xs border border-black bg-gray-100 hover:bg-gray-200 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs border border-black bg-green-700 text-white font-bold hover:bg-green-800"
              >
                Save & Connect
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
