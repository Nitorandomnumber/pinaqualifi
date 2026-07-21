export function ConsoleShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      {children}
    </main>
  )
}
