import { ConnectionStatus } from '@/components/connection-status'

export function BrandHeader() {
  return (
    <header className="flex items-center justify-between border-b border-black px-6 py-4 bg-white text-black">
      <span className="text-2xl font-bold tracking-wide sm:text-3xl">
        PINAQUALIFI
      </span>
      <ConnectionStatus />
    </header>
  )
}
