'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

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
  sections: Array<{
    title: string
    content: string
  }>
  author: string
  authorRole: string
  authorImage: string
  publishedAt: string
  updatedAt: string
}

export default function GuidePage() {
  const params = useParams()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        console.log('Fetching guide with slug:', params.slug)
        const response = await fetch(`/api/guides/${params.slug}`)
        const data = await response.json()
        
        if (response.ok) {
          setGuide(data.guide)
        } else {
          setError(data.error || 'Guide nicht gefunden')
          console.error('Error response:', data)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError('Fehler beim Laden des Guides')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchGuide()
    }
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Guide wird geladen...</p>
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
          <p className="text-sm text-gray-500 mt-2">Slug: {params.slug}</p>
        </div>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Guide nicht gefunden</h1>
          <p className="text-gray-600">Der angeforderte Guide existiert nicht.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-2 mb-4">
            {guide.operatingSystem.map((os) => (
              <span key={os} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                {os}
              </span>
            ))}
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              {guide.difficulty}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{guide.title}</h1>
          <p className="text-lg text-gray-600 mb-6">{guide.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Kategorie: {guide.category}</span>
            <span>Lesezeit: {guide.readTime}</span>
            <span>Erstellt: {new Date(guide.publishedAt).toLocaleDateString('de-DE')}</span>
          </div>
          
          {guide.tags.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {guide.sections.map((section, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">{section.title}</h2>
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }} />
              </div>
            </div>
          ))}
        </div>

        {/* Author */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <div className="flex items-center gap-4">
            {guide.authorImage && (
              <img 
                src={guide.authorImage} 
                alt={guide.author}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{guide.author}</h3>
              <p className="text-gray-600 text-sm">{guide.authorRole}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}