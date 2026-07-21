import { cn } from '@/lib/utils'

type Variant = 'success' | 'warning' | 'destructive' | 'info'

const VARIANTS: Record<Variant, string> = {
  success: 'bg-[#15803d] text-white hover:bg-[#166534]',
  warning: 'bg-[#eab308] text-black hover:bg-[#ca8a04]',
  destructive: 'bg-[#dc2626] text-white hover:bg-[#b91c1c]',
  info: 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]',
}

interface ConsoleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function ConsoleButton({
  variant = 'success',
  className,
  children,
  ...props
}: ConsoleButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center border border-black px-6 py-2.5 text-base font-bold tracking-wide transition shadow-sm',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
