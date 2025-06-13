'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SimpleNavbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Matsuda Béla
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname === '/' 
                  ? 'bg-blue-700 text-white' 
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              Home
            </Link>
            
            <div className="flex items-center space-x-2">
              <Link 
                href="/sign-in" 
                className="text-blue-100 hover:bg-blue-500 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Anmelden
              </Link>
              <Link 
                href="/sign-up" 
                className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}