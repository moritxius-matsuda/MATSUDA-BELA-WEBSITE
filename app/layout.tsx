import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../styles/tiptap.css'
import Navbar from '@/components/Navbar'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from "@vercel/analytics/next"

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
  metadataBase: new URL('https://moritxius.de'),
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: 'https://moritxius.de',
    title: 'Matsuda Béla Guides',
    description: 'Entdecke umfassende Anleitungen für Server-Administration, Virtualisierung und mehr',
    images: [
      {
        url: '/og-image.jpg',
        width: 1665,
        height: 929,
        alt: 'Matsuda Béla Guides',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matsuda Béla Guides',
    description: 'Entdecke umfassende Anleitungen für Server-Administration, Virtualisierung und mehr',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="de">
        <body className={`${inter.className}`} data-theme="light">
          <div className="liquid-bg">
            <div className="liquid-shape"></div>
            <div className="liquid-shape"></div>
            <div className="liquid-shape"></div>
          </div>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
            <Analytics/>
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}