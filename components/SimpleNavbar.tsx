'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SimpleNavbar() {
  const pathname = usePathname()

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Matsuda Béla
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === '/' 
                  ? 'glass-button text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:glass-button'
              }`}
            >
              Home
            </Link>

            <Link 
              href="/impressum" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === '/impressum' 
                  ? 'glass-button text-white shadow-lg' 
                  : 'text-white/80 hover:text-white hover:glass-button'
              }`}
            >
              Impressum
            </Link>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/sign-in" 
                className="text-white/80 hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:glass-button"
              >
                Anmelden
              </Link>
              <Link 
                href="/sign-up" 
                className="glass-button text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-lg"
              >
                Registrieren
              </Link>
            </div>
            
            <img 
              src="/rechteck-weiß.png" 
              alt="Matsuda Béla Logo" 
              className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity duration-300 ml-4"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}