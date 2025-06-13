'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Prüfe ob User Zugriff auf Relais hat
  const hasRelaisAccess = user?.publicMetadata?.relais === 1 || user?.publicMetadata?.admin === 1
  
  // Prüfe ob User Zugriff auf Guide-Editor hat
  const hasEditorAccess = user?.publicMetadata?.author === 1 || user?.publicMetadata?.admin === 1
  
  // Prüfe ob User Admin ist
  const isAdmin = user?.publicMetadata?.admin === 1

  return (
    <nav className="glass-navbar fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="/rechteck-weiß.png" 
                alt="Matsuda Béla" 
                className="h-8 w-auto opacity-90 md:hover:opacity-100 transition-opacity duration-300"
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
                  : 'text-white/80 md:hover:text-white md:hover:glass-button'
              }`}
            >
              Home
            </Link>
            
            {user && hasRelaisAccess && (
              <Link 
                href="/relais" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  pathname === '/relais' 
                    ? 'glass-button text-white shadow-lg' 
                    : 'text-white/80 md:hover:text-white md:hover:glass-button'
                }`}
              >
                Relais Steuerung
              </Link>
            )}

            {user && hasEditorAccess && (
              <Link 
                href="/guide-editor" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  pathname === '/guide-editor' 
                    ? 'glass-button text-white shadow-lg' 
                    : 'text-white/80 md:hover:text-white md:hover:glass-button'
                }`}
              >
                Guide Editor
              </Link>
            )}

            {user && isAdmin && (
              <Link 
                href="/admin/blobs"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${pathname === '/admin/blob' ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10'}`}
              >
                Blob Admin
              </Link>
            )}

            <Link 
              href="/impressum" 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                pathname === '/impressum' 
                  ? 'glass-button text-white shadow-lg' 
                  : 'text-white/80 md:hover:text-white md:hover:glass-button'
              }`}
            >
              Impressum
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-white/90 text-sm font-medium">
                  {user.firstName || user.emailAddresses[0].emailAddress}
                </span>
                <div className="glass-button rounded-full p-1">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/sign-in" 
                  className="text-white/80 md:hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 md:hover:glass-button"
                >
                  Anmelden
                </Link>
                <Link 
                  href="/sign-up" 
                  className="glass-button text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 md:hover:shadow-lg"
                >
                  Registrieren
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white/80 md:hover:text-white p-2 rounded-lg md:hover:glass-button transition-all duration-300"
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
                    : 'text-white/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {user && hasRelaisAccess && (
                <Link 
                  href="/relais" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    pathname === '/relais' 
                      ? 'glass-button text-white' 
                      : 'text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Relais Steuerung
                </Link>
              )}

              {user && hasEditorAccess && (
                <Link 
                  href="/guide-editor" 
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    pathname === '/guide-editor' 
                      ? 'glass-button text-white' 
                      : 'text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Guide Editor
                </Link>
              )}

              {user && isAdmin && (
                <Link 
                  href="/admin/blob"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                    pathname === '/admin/blob' 
                      ? 'glass-button text-white' 
                      : 'text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Blob Admin
                </Link>
              )}

              <Link 
                href="/impressum" 
                className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ${
                  pathname === '/impressum' 
                    ? 'glass-button text-white' 
                    : 'text-white/80'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Impressum
              </Link>
              
              {user ? (
                <div className="flex items-center space-x-3 px-3 py-2">
                  <span className="text-white/90 text-sm font-medium">
                    {user.firstName || user.emailAddresses[0].emailAddress}
                  </span>
                  <div className="glass-button rounded-full p-1">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link 
                    href="/sign-in" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/80 transition-all duration-300"
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
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}