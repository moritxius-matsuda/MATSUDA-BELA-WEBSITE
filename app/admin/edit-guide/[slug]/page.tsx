'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

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
  createdBy: string
}

// Rich Text Editor Component
function RichTextEditor({ value, onChange, placeholder }: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const [isEditing, setIsEditing] = useState(false)

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value)
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML
    onChange(content)
  }

  return (
    <div className="border border-gray-300 rounded-md">
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Fett"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Kursiv"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Unterstrichen"
        >
          <u>U</u>
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Aufzählung"
        >
          • Liste
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Nummerierte Liste"
        >
          1. Liste
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'h3')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Überschrift"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => formatText('formatBlock', 'p')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Absatz"
        >
          P
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('indent')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Einrücken"
        >
          →
        </button>
        <button
          type="button"
          onClick={() => formatText('outdent')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          title="Ausrücken"
        >
          ←
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('removeFormat')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200 text-red-600"
          title="Formatierung entfernen"
        >
          ✕
        </button>
      </div>
      
      {/* Editor Container */}
      <div className="relative">
        <div
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className="p-3 min-h-[200px] focus:outline-none"
          style={{ whiteSpace: 'pre-wrap' }}
        />
        
        {/* Placeholder */}
        {!value && placeholder && (
          <div className="absolute top-3 left-3 text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditGuidePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    operatingSystem: [] as string[],
    difficulty: '',
    readTime: '',
    tags: [] as string[],
    sections: [] as Array<{
      title: string
      content: string
      path?: string
    }>,
    author: '',
    authorRole: '',
    authorImage: ''
  })

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const response = await fetch(`/api/guides/${params.slug}`)
        const data = await response.json()
        
        if (response.ok) {
          const guideData = data.guide
          setGuide(guideData)
          setFormData({
            title: guideData.title,
            description: guideData.description,
            category: guideData.category,
            operatingSystem: guideData.operatingSystem,
            difficulty: guideData.difficulty,
            readTime: guideData.readTime,
            tags: guideData.tags,
            sections: guideData.sections,
            author: guideData.author,
            authorRole: guideData.authorRole,
            authorImage: guideData.authorImage
          })
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

  // Prüfe Berechtigung
  const canEdit = user && guide && (
    user.publicMetadata?.role === 'admin' || 
    guide.createdBy === user.id ||
    guide.author === user.fullName
  )

  const handleSave = async () => {
    if (!guide) return

    setSaving(true)
    try {
      const response = await fetch(`/api/guides/${guide.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
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

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, { title: '', content: '', path: '' }]
    }))
  }

  const updateSection = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }))
  }

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }))
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

  if (error || !canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Keine Berechtigung'}
          </h1>
          <p className="text-gray-600">
            {error || 'Sie haben keine Berechtigung, diesen Guide zu bearbeiten.'}
          </p>
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
            {/* Grunddaten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titel
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategorie
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Betriebssysteme und weitere Optionen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Betriebssysteme
                </label>
                <div className="space-y-2">
                  {['Windows', 'Linux', 'macOS', 'Ubuntu', 'Debian', 'CentOS', 'RHEL', 'Arch Linux', 'FreeBSD'].map((os) => (
                    <label key={os} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.operatingSystem.includes(os)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              operatingSystem: [...prev.operatingSystem, os]
                            }))
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              operatingSystem: prev.operatingSystem.filter(item => item !== os)
                            }))
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{os}</span>
                    </label>
                  ))}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Eigenes Betriebssystem hinzufügen..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          const newOS = e.currentTarget.value.trim()
                          if (!formData.operatingSystem.includes(newOS)) {
                            setFormData(prev => ({
                              ...prev,
                              operatingSystem: [...prev.operatingSystem, newOS]
                            }))
                          }
                          e.currentTarget.value = ''
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  {/* Ausgewählte Betriebssysteme anzeigen */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.operatingSystem.map((os) => (
                      <span
                        key={os}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {os}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              operatingSystem: prev.operatingSystem.filter(item => item !== os)
                            }))
                          }}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Schwierigkeit
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Schwierigkeit wählen</option>
                  <option value="Einfach">Einfach</option>
                  <option value="Mittel">Mittel</option>
                  <option value="Schwer">Schwer</option>
                  <option value="Experte">Experte</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesezeit
                </label>
                <input
                  type="text"
                  value={formData.readTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                  placeholder="z.B. 30 Minuten"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (mit Enter hinzufügen)
                </label>
                <input
                  type="text"
                  placeholder="Tag eingeben und Enter drücken..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newTag = e.currentTarget.value.trim()
                      if (!formData.tags.includes(newTag)) {
                        setFormData(prev => ({
                          ...prev,
                          tags: [...prev.tags, newTag]
                        }))
                      }
                      e.currentTarget.value = ''
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            tags: prev.tags.filter(item => item !== tag)
                          }))
                        }}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
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

              {formData.sections.map((section, index) => (
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
                        onChange={(value) => updateSection(index, 'content', value)}
                        placeholder="Geben Sie den Inhalt ein..."
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