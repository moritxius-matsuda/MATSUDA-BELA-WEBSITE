'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import RichTextEditor from '@/components/RichTextEditor'

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
    path?: string
  }>
  author: string
  authorRole: string
  authorImage: string
  publishedAt: string
  updatedAt: string
  createdBy?: string
}

export default function SimpleEditGuidePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState<Array<{
    title: string
    content: string
    path?: string
  }>>([])

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch(`/api/guides/${params.slug}`)
        const data = await response.json()
        
        if (response.ok) {
          const guideData = data.guide
          setGuide(guideData)
          setTitle(guideData.title)
          setDescription(guideData.description)
          setSections(guideData.sections)
        } else {
          setError(data.error || 'Guide nicht gefunden')
        }
      } catch (err) {
        setError('Fehler beim Laden des Guides')
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchGuide()
    }
  }, [params.slug])

  const handleSave = async () => {
    if (!guide) return

    setSaving(true)
    try {
      const response = await fetch(`/api/guides/${guide.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          sections,
          category: guide.category,
          operatingSystem: guide.operatingSystem,
          difficulty: guide.difficulty,
          readTime: guide.readTime,
          tags: guide.tags,
          author: guide.author,
          authorRole: guide.authorRole,
          authorImage: guide.authorImage
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Guide erfolgreich aktualisiert!')
        router.push(`/guides/${guide.slug}`)
      } else {
        alert(`Fehler beim Speichern: ${data.error}`)
      }
    } catch (error) {
      alert('Netzwerkfehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const updateSection = (index: number, field: string, value: string) => {
    setSections(prev => prev.map((section, i) => 
      i === index ? { ...section, [field]: value } : section
    ))
  }

  const addSection = () => {
    setSections(prev => [...prev, { title: '', content: '', path: '' }])
  }

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

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
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Guide bearbeiten</h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Speichere...' : 'Speichern'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titel
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Beschreibung */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sections */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inhaltsabschnitte</h3>
                <button
                  onClick={addSection}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  + Abschnitt hinzufügen
                </button>
              </div>

              {sections.map((section, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">Abschnitt {index + 1}</h4>
                    <button
                      onClick={() => removeSection(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Entfernen
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titel
                      </label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Inhalt
                      </label>
                      <RichTextEditor
                        value={section.content}
                        onChange={(content) => updateSection(index, 'content', content)}
                        placeholder="Geben Sie den Inhalt ein..."
                        className="min-h-[200px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pfad/Befehl (optional)
                      </label>
                      <input
                        type="text"
                        value={section.path || ''}
                        onChange={(e) => updateSection(index, 'path', e.target.value)}
                        placeholder="z.B. /etc/nginx/nginx.conf oder apt update"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}