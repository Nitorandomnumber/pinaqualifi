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
  title: 'Piña-QualiFi — Queen Pineapple Fiber Assessment Console',
  description:
    'Piña-QualiFi: An Automated Quality Assessment and Grading System for Queen Pineapple Fiber.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Piña-QualiFi',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
