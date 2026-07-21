export function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-4 py-1 text-base sm:text-lg text-black">
      <span>{label}</span>
      <span aria-hidden="true">:</span>
      <span className="text-right font-bold tabular-nums">{value}</span>
    </div>
  )
}
