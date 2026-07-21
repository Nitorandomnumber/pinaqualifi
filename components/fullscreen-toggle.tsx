'use client'

import { useEffect, useState } from 'react'

export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      } else {
        await document.exitFullscreen()
      }
    } catch {
      /* Fullscreen API fallback */
    }
  }

  return (
    <button
      onClick={toggleFullscreen}
      className="inline-flex select-none items-center justify-center border border-black bg-white px-2 py-0.5 text-xs font-bold text-black hover:bg-gray-100"
      title="Toggle Fullscreen Mode"
    >
      {isFullscreen ? '[ ⛶ Exit ]' : '[ ⛶ Fullscreen ]'}
    </button>
  )
}
