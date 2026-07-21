import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { PT_Serif } from 'next/font/google'
import './globals.css'
import { MachineProvider } from '@/components/machine-provider'
import { RotatePrompt } from '@/components/rotate-prompt'

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
})

export const metadata: Metadata = {
  title: 'PINAQUALIFI — Abaca Fiber Grading Console',
  description:
    'Offline-first command console for the ESP32-based Abaca Fiber Grading Machine.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PINAQUALIFI',
  },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`light ${ptSerif.variable} bg-background`}>
      <body className="antialiased">
        <MachineProvider>
          <RotatePrompt />
          <div className="landscape-app">{children}</div>
        </MachineProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
