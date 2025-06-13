'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Guide {
  id: string
  title: string
  description: string
  category: string
  operatingSystem: string[]
  difficulty: string
  readTime: string
  slug: string
  tags: string[]
  author: string
  publishedAt: string
  createdBy?: string
}

export default function ManageGuidesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Prüfe Admin-Berechtigung
  const isAdmin = user?.publicMetadata?.admin === 1

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/')
      return
    }

    const fetchGuides = async () => {
      try {
        const response = await fetch('/api/guides')
        const data = await response.json()
        
        if (response.ok) {
          setGuides(data.guides || [])
        } else {
          setError(data.error || 'Fehler beim Laden der Guides')
        }
      } catch (err) {
        setError('Netzwerkfehler beim Laden der Guides')
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded && isAdmin) {
      fetchGuides()
    }
  }, [isLoaded, isAdmin, router])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Möchten Sie den Guide "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    setDeleting(slug)
    try {
      const response = await fetch(`/api/guides/${slug}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // Guide aus der Liste entfernen
        setGuides(prev => prev.filter(guide => guide.slug !== slug))
        alert('Guide erfolgreich gelöscht!')
      } else {
        alert(`Fehler beim Löschen: ${data.error}`)
      }
    } catch (error) {
      alert('Netzwerkfehler beim Löschen')
    } finally {
      setDeleting(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Guides...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600">Sie haben keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fehler</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Neu laden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Guide-Verwaltung</h1>
                <p className="text-gray-600 mt-1">Verwalten Sie alle Guides auf der Website</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/guide-editor"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Neuer Guide
                </Link>
                <Link
                  href="/admin/create-guide"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Proxmox Guide
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{guides.length}</div>
                <div className="text-sm text-gray-600">Gesamt Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {guides.filter(g => g.category === 'Proxmox').length}
                </div>
                <div className="text-sm text-gray-600">Proxmox Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {guides.filter(g => g.category === 'Linux').length}
                </div>
                <div className="text-sm text-gray-600">Linux Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {guides.filter(g => g.category === 'Netzwerk').length}
                </div>
                <div className="text-sm text-gray-600">Netzwerk Guides</div>
              </div>
            </div>
          </div>

          {/* Guides Liste */}
          <div className="p-6">
            {guides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Guides vorhanden</h3>
                <p className="text-gray-600 mb-4">Erstellen Sie Ihren ersten Guide</p>
                <Link
                  href="/guide-editor"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guide erstellen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guide
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {guide.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-md truncate">
                                {guide.description}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Slug: {guide.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {guide.category}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {guide.difficulty} • {guide.readTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guide.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(guide.publishedAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              href={`/guides/${guide.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Anzeigen
                            </Link>
                            <Link
                              href={`/admin/simple-edit/${guide.slug}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Bearbeiten
                            </Link>
                            <button
                              onClick={() => handleDelete(guide.slug, guide.title)}
                              disabled={deleting === guide.slug}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleting === guide.slug ? 'Lösche...' : 'Löschen'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Guide {
  id: string
  title: string
  description: string
  category: string
  operatingSystem: string[]
  difficulty: string
  readTime: string
  slug: string
  tags: string[]
  author: string
  publishedAt: string
  createdBy?: string
}

export default function ManageGuidesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Prüfe Admin-Berechtigung
  const isAdmin = user?.publicMetadata?.admin === 1

  useEffect(() => {
    if (isLoaded && !isAdmin) {
      router.push('/')
      return
    }

    const fetchGuides = async () => {
      try {
        const response = await fetch('/api/guides')
        const data = await response.json()
        
        if (response.ok) {
          setGuides(data.guides || [])
        } else {
          setError(data.error || 'Fehler beim Laden der Guides')
        }
      } catch (err) {
        setError('Netzwerkfehler beim Laden der Guides')
      } finally {
        setLoading(false)
      }
    }

    if (isLoaded && isAdmin) {
      fetchGuides()
    }
  }, [isLoaded, isAdmin, router])

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Möchten Sie den Guide "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    setDeleting(slug)
    try {
      const response = await fetch(`/api/guides/${slug}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        // Guide aus der Liste entfernen
        setGuides(prev => prev.filter(guide => guide.slug !== slug))
        alert('Guide erfolgreich gelöscht!')
      } else {
        alert(`Fehler beim Löschen: ${data.error}`)
      }
    } catch (error) {
      alert('Netzwerkfehler beim Löschen')
    } finally {
      setDeleting(null)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Guides...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600">Sie haben keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fehler</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Neu laden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Guide-Verwaltung</h1>
                <p className="text-gray-600 mt-1">Verwalten Sie alle Guides auf der Website</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/guide-editor"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  + Neuer Guide
                </Link>
                <Link
                  href="/admin/create-guide"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Proxmox Guide
                </Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{guides.length}</div>
                <div className="text-sm text-gray-600">Gesamt Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {guides.filter(g => g.category === 'Proxmox').length}
                </div>
                <div className="text-sm text-gray-600">Proxmox Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {guides.filter(g => g.category === 'Linux').length}
                </div>
                <div className="text-sm text-gray-600">Linux Guides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {guides.filter(g => g.category === 'Netzwerk').length}
                </div>
                <div className="text-sm text-gray-600">Netzwerk Guides</div>
              </div>
            </div>
          </div>

          {/* Guides Liste */}
          <div className="p-6">
            {guides.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Guides vorhanden</h3>
                <p className="text-gray-600 mb-4">Erstellen Sie Ihren ersten Guide</p>
                <Link
                  href="/guide-editor"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guide erstellen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guide
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategorie
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Autor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Erstellt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guides.map((guide) => (
                      <tr key={guide.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {guide.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-md truncate">
                                {guide.description}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                Slug: {guide.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {guide.category}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {guide.difficulty} • {guide.readTime}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {guide.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(guide.publishedAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              href={`/guides/${guide.slug}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Anzeigen
                            </Link>
                            <Link
                              href={`/admin/simple-edit/${guide.slug}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              Bearbeiten
                            </Link>
                            <button
                              onClick={() => handleDelete(guide.slug, guide.title)}
                              disabled={deleting === guide.slug}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                            >
                              {deleting === guide.slug ? 'Lösche...' : 'Löschen'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}