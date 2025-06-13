'use client'

import { useEffect, useState } from 'react'
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

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch('/api/guides')
        const data = await response.json()
        
        if (response.ok) {
          setGuides(data.guides)
        } else {
          setError(data.error || 'Fehler beim Laden der Guides')
        }
      } catch (err) {
        setError('Netzwerkfehler beim Laden der Guides')
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Guides werden geladen...</p>
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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Alle Guides</h1>
          <p className="text-lg text-gray-600">
            Entdecken Sie unsere umfassende Sammlung von Anleitungen und Tutorials.
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Keine Guides gefunden</h2>
            <p className="text-gray-600">Es wurden noch keine Guides erstellt.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
              >
                <div className="flex items-center gap-2 mb-3">
                  {guide.operatingSystem.map((os) => (
                    <span key={os} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {os}
                    </span>
                  ))}
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    {guide.difficulty}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {guide.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {guide.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>von {guide.author}</span>
                  <span>{guide.readTime}</span>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  {new Date(guide.publishedAt).toLocaleDateString('de-DE')}
                </div>

                {guide.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {guide.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                    {guide.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{guide.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}