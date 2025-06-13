'use client'

import React, { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  relais: boolean
  admin: boolean
}

interface SimpleAuthProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRelais?: boolean
}

export default function SimpleAuth({ children, requireAuth = false, requireRelais = false }: SimpleAuthProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Simulierte Benutzer (in der Realität würde das über eine echte API laufen)
  const users = [
    { id: '1', email: 'admin@moritxius.de', password: 'admin123', relais: true, admin: true },
    { id: '2', email: 'relais@moritxius.de', password: 'relais123', relais: true, admin: false },
    { id: '3', email: 'user@moritxius.de', password: 'user123', relais: false, admin: false },
  ]

  useEffect(() => {
    // Prüfe ob User bereits eingeloggt ist (localStorage)
    const savedUser = localStorage.getItem('simpleauth_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const foundUser = users.find(u => u.email === email && u.password === password)
    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        email: foundUser.email,
        relais: foundUser.relais,
        admin: foundUser.admin
      }
      setUser(userWithoutPassword)
      localStorage.setItem('simpleauth_user', JSON.stringify(userWithoutPassword))
      setShowLogin(false)
      setEmail('')
      setPassword('')
    } else {
      setError('Ungültige Anmeldedaten')
    }
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('simpleauth_user')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Wenn Authentifizierung erforderlich ist, aber kein User eingeloggt
  if (requireAuth && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {error && (
              <div className="mb-4 text-red-600 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Anmelden
            </button>
          </form>
          
          <div className="mt-6 text-sm text-gray-600">
            <p className="font-semibold">Test-Accounts:</p>
            <p>Admin: admin@moritxius.de / admin123</p>
            <p>Relais: relais@moritxius.de / relais123</p>
            <p>User: user@moritxius.de / user123</p>
          </div>
        </div>
      </div>
    )
  }

  // Wenn Relais-Zugriff erforderlich ist, aber User hat keine Berechtigung
  if (requireRelais && user && !user.relais && !user.admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h2>
          <p className="text-gray-600 mb-4">
            Sie haben keine Berechtigung für die Relais-Steuerung.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Angemeldet als: {user.email}
          </p>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Abmelden
          </button>
        </div>
      </div>
    )
  }

  // Stelle User-Kontext für Kinder zur Verfügung
  return (
    <div>
      {/* User Info in Navbar wird über Props weitergegeben */}
      {React.cloneElement(children as React.ReactElement, { user, onLogout: handleLogout })}
    </div>
  )
}