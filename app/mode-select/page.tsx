'use client'

import { useRouter } from 'next/navigation'
import { BrandHeader } from '@/components/brand-header'
import { ConsoleShell } from '@/components/console-shell'
import { ConsoleButton } from '@/components/console-button'
import { useMachine, type Mode } from '@/components/machine-provider'

interface ModeCard {
  mode: Mode
  title: string
  subtitle?: string
  bullets: string[]
  href: string
}

const CARDS: ModeCard[] = [
  {
    mode: 'conveyor',
    title: 'AUTOMATED CONVEYOR MODE',
    subtitle: '(DEFAULT)',
    bullets: [
      'Uses full 12V system, relays, & mechanical pushers',
      'Continuous batch sorting with ultrasonic entrance tracking',
    ],
    href: '/dashboard/conveyor',
  },
  {
    mode: 'handheld',
    title: 'DETACHABLE HANDHELD MODE',
    bullets: [
      'Conveyor motor completely cut off | Running safely on Battery Pack',
      'Manual optical scanning via TCS3200 / IR array',
    ],
    href: '/dashboard/handheld',
  },
]

export default function ModeSelectPage() {
  const router = useRouter()
  const { setMode, resetBatch } = useMachine()

  const select = (card: ModeCard) => {
    resetBatch()
    setMode(card.mode)
    router.push(`/boot?mode=${card.mode}`)
  }

  return (
    <ConsoleShell>
      <BrandHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-6 bg-white text-black">
        <h1 className="text-xl font-bold tracking-wide sm:text-2xl text-black">
          SELECT OPERATING MODE
        </h1>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {CARDS.map((card) => {
            const isDisabled = card.mode === 'conveyor'
            return (
              <div
                key={card.mode}
                className={`flex flex-col items-center justify-between gap-5 border border-black bg-white px-6 py-6 text-center ${
                  isDisabled ? 'opacity-60 bg-gray-50' : ''
                }`}
              >
                <div>
                  <h2 className="text-lg font-bold sm:text-xl text-black">
                    {card.title}
                  </h2>
                  {card.subtitle ? (
                    <p className="text-base font-bold sm:text-lg text-black">
                      {card.subtitle}
                    </p>
                  ) : null}
                  {isDisabled ? (
                    <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 border border-red-200 px-2 py-0.5">
                      Unavailable for Presentation
                    </span>
                  ) : null}
                </div>
                <ul className="w-full space-y-2 text-left text-base sm:text-lg text-black">
                  {card.bullets.map((b) => (
                    <li key={b} className="flex gap-2 items-start">
                      <span aria-hidden="true">&middot;</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <ConsoleButton
                  variant={isDisabled ? 'warning' : 'success'}
                  disabled={isDisabled}
                  onClick={() => select(card)}
                >
                  {isDisabled ? '[ Mode Disabled ]' : '[ Select Mode ]'}
                </ConsoleButton>
              </div>
            )
          })}
        </div>
      </div>
    </ConsoleShell>
  )
}
