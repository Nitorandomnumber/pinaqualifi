'use client'

import { InfoRow } from '@/components/info-row'
import { useMachine } from '@/components/machine-provider'
import { formatCleanliness, formatTexture } from '@/lib/machine'

export function ScanResultBox({
  title,
  status,
  footer,
}: {
  title: string
  status?: string
  footer?: React.ReactNode
}) {
  const { scan } = useMachine()
  const cleanliness =
    scan.cleanliness === '----' ? '----' : formatCleanliness(scan.cleanliness)
  const texture =
    scan.texture === '----' ? '----' : formatTexture(scan.texture)
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-bold tracking-wide sm:text-base text-black uppercase">{title}</h2>
      <div className="border border-black px-4 py-2.5 bg-white">
        <InfoRow label="Classification Grade" value={scan.grade} />
        <InfoRow label="Quality Score" value={scan.score} />
        <InfoRow label="Cleanliness Level" value={cleanliness} />
        <InfoRow label="Surface Texture" value={texture} />
      </div>
      {status ? <p className="text-xs sm:text-sm text-black">Status: {status}</p> : null}
      {footer}
    </section>
  )
}
