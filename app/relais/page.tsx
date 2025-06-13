'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import RelaisCard from '@/components/RelaisCard'

interface ApiResponse {
  status: string
  relays: {
    [key: string]: 'ON' | 'OFF'
  }
}

interface RelaisStatus {
  [key: string]: 'ON' | 'OFF'
}

export default function RelaisPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [relaisStatus, setRelaisStatus] = useState<RelaisStatus>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Erstelle Array mit 16 Relais
  const relaisNumbers = Array.from({ length: 16 }, (_, i) => i + 1)

  // Prüfe Berechtigung
  const hasAccess = user?.publicMetadata?.relais === 1 || user?.publicMetadata?.admin === 1

  // useCallback für fetchStatus um Abhängigkeiten zu stabilisieren
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('https://door.moritxius.de/api/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-password': 'r>(gy3J)g~8S#=v§'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse = await response.json()
      setRelaisStatus(data.relays)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden des Status')
      console.error('Fehler beim Abrufen des Status:', err)
    } finally {
      setLoading(false)
    }
  }, []) // Leere Abhängigkeitsliste für useCallback

  const toggleRelais = async (relaisNumber: number, action: 'open' | 'close') => {
    try {
      const response = await fetch(`https://door.moritxius.de/api/${relaisNumber}/${action}`, {
        method: 'POST',
        headers: {
          'x-api-password': 'r>(gy3J)g~8S#=v§'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Status nach der Aktion aktualisieren
      await fetchStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Schalten des Relais')
      console.error('Fehler beim Schalten des Relais:', err)
    }
  }

  useEffect(() => {
    // Prüfe erst ob User geladen ist
    if (!isLoaded) return

    // Wenn kein User oder keine Berechtigung, redirect zur Anmeldung
    if (!user || !hasAccess) {
      router.push('/sign-in')
      return
    }

    // Lade Status initial
    fetchStatus()
    
    // Status alle 5 Sekunden aktualisieren
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [isLoaded, user, hasAccess, router, fetchStatus])

  // Loading state während User-Daten geladen werden
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Lade Benutzerdaten...</p>
          </div>
        </div>
      </div>
    )
  }

  // Wenn kein Zugriff
  if (!user || !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Zugriff verweigert
            </h1>
            <p className="text-white/80 mb-4">
              Sie haben keine Berechtigung für die Relais-Steuerung.
            </p>
            <p className="text-sm text-white/60">
              Kontaktieren Sie den Administrator, um Zugriff zu erhalten.
              <br />
              (Benötigt: relais=1 oder admin=1 in Public Metadata)
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading && Object.keys(relaisStatus).length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Lade Relais Status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="glass-card p-6 mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Relais Steuerung
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-white/80">
              Steuerung von 16 Relais über door.moritxius.de
            </p>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="glass-button text-white px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Aktualisieren
            </button>
          </div>
          
          {error && (
            <div className="mt-4 glass-card p-4 border border-red-400/30">
              <strong className="text-red-400">Fehler:</strong> <span className="text-white/80">{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {relaisNumbers.map((number) => (
          <RelaisCard
            key={number}
            relaisNumber={number}
            isOpen={relaisStatus[number.toString()] === 'ON'}
            onToggle={toggleRelais}
            loading={loading}
          />
        ))}
      </div>

      <div className="mt-8 glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">API Information</h3>
        <div className="text-sm text-white/70 space-y-2">
          <p><strong className="text-white/90">Server:</strong> door.moritxius.de</p>
          <p><strong className="text-white/90">Status Endpoint:</strong> GET /api/status</p>
          <p><strong className="text-white/90">Steuerung:</strong> POST /api/[relaisnummer]/[open/close]</p>
          <p><strong className="text-white/90">Authentifizierung:</strong> Header x-api-password erforderlich</p>
        </div>
      </div>
    </div>
  )
}