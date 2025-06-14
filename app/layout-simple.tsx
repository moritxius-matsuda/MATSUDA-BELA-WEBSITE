import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SimpleNavbar from '@/components/SimpleNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Matsuda Béla Guides',
  description: 'Entdecke umfassende Anleitungen für Server-Administration, Virtualisierung und mehr',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <div className="liquid-bg">
          <div className="liquid-shape"></div>
          <div className="liquid-shape"></div>
          <div className="liquid-shape"></div>
        </div>
        <SimpleNavbar />
        <main className="min-h-screen pt-16">
          {children}
        </main>
      </body>
    </html>
  )
}