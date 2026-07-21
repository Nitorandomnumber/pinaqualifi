import Image from 'next/image'
import { ConnectionStatus } from '@/components/connection-status'
import { FullscreenToggle } from '@/components/fullscreen-toggle'

export function BrandHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black px-6 py-3 bg-white text-black">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Piña-QualiFi"
          width={220}
          height={65}
          className="h-10 sm:h-12 w-auto object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-4">
        <FullscreenToggle />
        <ConnectionStatus />
      </div>
    </header>
  )
}
