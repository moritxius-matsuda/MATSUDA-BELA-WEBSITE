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
        <div className="max-w-md mx-auto glass-card p-8">
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Anmeldung erforderlich</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-white/90 text-sm font-bold mb-2">
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-full focus:outline-none"
                placeholder="Ihre E-Mail-Adresse"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-white/90 text-sm font-bold mb-2">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-full focus:outline-none"
                placeholder="Ihr Passwort"
                required
              />
            </div>
            {error && (
              <div className="mb-4 text-red-400 text-sm text-center font-medium">{error}</div>
            )}
            <button
              type="submit"
              className="glass-button w-full text-white font-bold py-3 px-4 rounded-full transition-all duration-300 hover:shadow-lg"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Wenn Relais-Zugriff erforderlich ist, aber User hat keine Berechtigung
  if (requireRelais && user && !user.relais && !user.admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-6">Zugriff verweigert</h2>
          <p className="text-white/80 mb-4">
            Sie haben keine Berechtigung für die Relais-Steuerung.
          </p>
          <p className="text-sm text-white/60 mb-6">
            Angemeldet als: {user.email}
          </p>
          <button
            onClick={handleLogout}
            className="glass-button text-red-300 hover:text-red-200 font-bold py-3 px-6 rounded-full transition-all duration-300"
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