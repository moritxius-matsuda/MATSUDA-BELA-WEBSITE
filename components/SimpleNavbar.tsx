'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function SimpleNavbar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/rechteck-weiß.png" 
                alt="Matsuda Béla" 
                className="h-8 w-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextElement) {
                    nextElement.style.display = 'block';
                  }
                }}
              />
              <span 
                className="text-white text-xl font-bold hidden"
                style={{ display: 'none' }}
              >
                Matsuda Béla
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 hover:text-white p-2 rounded-lg hover:glass-button transition-all duration-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/20 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  pathname === '/' 
                    ? 'glass-button text-white' 
                    : 'text-white/80 hover:text-white hover:glass-button'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <Link 
                href="/impressum" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  pathname === '/impressum' 
                    ? 'glass-button text-white' 
                    : 'text-white/80 hover:text-white hover:glass-button'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Impressum
              </Link>
              
              <div className="space-y-1">
                <Link 
                  href="/sign-in" 
                  className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:glass-button transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Anmelden
                </Link>
                <Link 
                  href="/sign-up" 
                  className="block px-3 py-2 rounded-md text-base font-medium glass-button text-white transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrieren
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}