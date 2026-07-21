import Image from 'next/image'
import { ConnectionStatus } from '@/components/connection-status'
import { FullscreenToggle } from '@/components/fullscreen-toggle'

export function BrandHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black px-4 py-1.5 bg-white text-black">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Piña-QualiFi"
          width={180}
          height={50}
          className="h-8 sm:h-9 w-auto object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-3">
        <FullscreenToggle />
        <ConnectionStatus />
      </div>
    </header>
  )
}
