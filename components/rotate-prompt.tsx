import { RotateCcw } from 'lucide-react'

export function RotatePrompt() {
  return (
    <div className="rotate-prompt fixed inset-0 z-50 flex-col items-center justify-center gap-4 bg-background px-8 text-center">
      <RotateCcw className="h-10 w-10 text-foreground" aria-hidden="true" />
      <h1 className="text-xl font-bold">Rotate your device</h1>
      <p className="text-pretty text-sm text-muted-foreground">
        PINAQUALIFI is designed for landscape orientation. Please turn your
        device sideways to use the console.
      </p>
    </div>
  )
}
