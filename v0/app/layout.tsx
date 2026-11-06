import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ConvoQ — Conversation Intelligence',
  description: 'A multi-agent intelligence workspace for understanding your conversations.',
  generator: 'v0.app',
}
export const viewport: Viewport = { colorScheme: 'dark', themeColor: '#090b12', userScalable: false }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
