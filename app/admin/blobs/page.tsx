'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'

interface BlobFile {
  pathname: string
  url: string
  size: number
  uploadedAt: string
}

export default function BlobsAdminPage() {
  const { isSignedIn } = useAuth()
  const [blobs, setBlobs] = useState<BlobFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isSignedIn) {
      loadBlobs()
    }
  }, [isSignedIn])

  const loadBlobs = async () => {
    try {
      const response = await fetch('/api/admin/blobs')
      if (response.ok) {
        const result = await response.json()
        setBlobs(result.blobs || [])
      }
    } catch (error) {
      console.error('Error loading blobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteBlob = async (url: string, pathname: string) => {
    if (!confirm(`Möchten Sie die Datei "${pathname}" wirklich löschen?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/blobs', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (response.ok) {
        alert('Datei erfolgreich gelöscht')
        loadBlobs() // Reload the list
      } else {
        alert('Fehler beim Löschen der Datei')
      }
    } catch (error) {
      console.error('Error deleting blob:', error)
      alert('Fehler beim Löschen der Datei')
    }
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Zugriff verweigert</h1>
          <p className="text-white/80">Sie müssen angemeldet sein, um diese Seite zu sehen.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-white">Lade Dateien...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Blob-Dateien verwalten</h1>
      
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Alle Dateien ({blobs.length})</h2>
          <button
            onClick={loadBlobs}
            className="glass-button px-4 py-2 text-white rounded-lg"
          >
            Aktualisieren
          </button>
        </div>

        {blobs.length === 0 ? (
          <p className="text-white/80">Keine Dateien gefunden.</p>
        ) : (
          <div className="space-y-4">
            {blobs.map((blob, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
                <div className="flex-1">
                  <h3 className="text-white font-medium">{blob.pathname}</h3>
                  <p className="text-white/60 text-sm">
                    Größe: {(blob.size / 1024).toFixed(2)} KB | 
                    Hochgeladen: {new Date(blob.uploadedAt).toLocaleString('de-DE')}
                  </p>
                  <p className="text-white/40 text-xs break-all">{blob.url}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <a
                    href={blob.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded border border-blue-400/30 hover:bg-blue-500/30 transition-colors"
                  >
                    Öffnen
                  </a>
                  <button
                    onClick={() => deleteBlob(blob.url, blob.pathname)}
                    className="px-3 py-1 bg-red-500/20 text-red-300 text-sm rounded border border-red-400/30 hover:bg-red-500/30 transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}