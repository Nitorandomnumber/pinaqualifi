export function ConsoleShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-dvh w-full flex-col overflow-y-auto bg-background text-foreground">
      {children}
    </main>
  )
}
