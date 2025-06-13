'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton, useUser } from '@clerk/nextjs'

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useUser()

  // Prüfe ob User Zugriff auf Relais hat
  const hasRelaisAccess = user?.publicMetadata?.relais === 1 || user?.publicMetadata?.admin === 1

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
                  e.currentTarget.nextElementSibling.style.display = 'block';
                }}
              />
              <span 
                className="text-white text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden"
                style={{ display: 'none' }}
              >
                Matsuda Béla
              </span>
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
            
            {user && hasRelaisAccess && (
              <Link 
                href="/relais" 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  pathname === '/relais' 
                    ? 'glass-button text-white shadow-lg' 
                    : 'text-white/80 hover:text-white hover:glass-button'
                }`}
              >
                Relais Steuerung
              </Link>
            )}

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
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}