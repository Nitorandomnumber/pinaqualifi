import Image from 'next/image'
import { ConnectionStatus } from '@/components/connection-status'

export function BrandHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black px-6 py-3 bg-white text-black">
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Piña-QualiFi"
          width={180}
          height={50}
          className="h-9 w-auto object-contain"
          priority
        />
      </div>
      <ConnectionStatus />
    </header>
  )
}
