import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SimpleNavbar from '@/components/SimpleNavbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Matsuda Béla Website',
  description: 'Relais Steuerung System',
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