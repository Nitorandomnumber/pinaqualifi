export function InfoRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[auto_auto_1fr] items-baseline gap-x-3 py-0.5 text-xs sm:text-sm text-black">
      <span>{label}</span>
      <span aria-hidden="true">:</span>
      <span className="text-right font-bold tabular-nums">{value}</span>
    </div>
  )
}
