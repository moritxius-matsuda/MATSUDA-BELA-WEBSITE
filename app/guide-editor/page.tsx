'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { categories, operatingSystems, difficulties } from '@/data/guides'
import SimpleTiptapEditor from '@/components/SimpleTiptapEditor'

interface GuideSection {
  id: string
  type: 'text'
  content: string
}

export default function GuideEditorPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editSlug = searchParams.get('edit')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Virtualisierung')
  const [selectedOS, setSelectedOS] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<'Anfänger' | 'Fortgeschritten' | 'Experte'>('Anfänger')
  const [readTime, setReadTime] = useState('')
  const [tags, setTags] = useState('')
  const [sections, setSections] = useState<GuideSection[]>([
    { id: '1', type: 'text', content: '' }
  ])
  
  // Loading and error states
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [originalSlug, setOriginalSlug] = useState('')
  const [customOS, setCustomOS] = useState('')

  // Check permissions
  const hasAccess = user?.publicMetadata?.author === 1 || user?.publicMetadata?.admin === 1

  // Lade bestehenden Guide wenn im Edit-Modus
  useEffect(() => {
    if (!editSlug || !user) return

    const loadGuide = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/guides/${editSlug}`)
        if (response.ok) {
          const result = await response.json()
          const guide = result.guide
          
          // Prüfe Berechtigung
          if (!guide.canEdit) {
            setError('Sie haben keine Berechtigung, diesen Guide zu bearbeiten.')
            return
          }

          // Lade Guide-Daten in das Formular
          setTitle(guide.title || '')
          setDescription(guide.description || '')
          setCategory(guide.category || 'Virtualisierung')
          setSelectedOS(guide.operatingSystem || [])
          setDifficulty(guide.difficulty || 'Anfänger')
          setReadTime(guide.readTime || '')
          setTags(guide.tags ? guide.tags.join(', ') : '')
          setSections(guide.sections || [{ id: '1', type: 'text', content: '' }])
          setIsEditMode(true)
          setOriginalSlug(guide.slug)
        } else {
          setError('Guide nicht gefunden oder keine Berechtigung.')
        }
      } catch (error) {
        console.error('Error loading guide:', error)
        setError('Fehler beim Laden des Guides.')
      } finally {
        setLoading(false)
      }
    }

    loadGuide()
  }, [editSlug, user])

  useEffect(() => {
    if (!isLoaded) return

    if (!user || !hasAccess) {
      router.push('/sign-in')
      return
    }
  }, [isLoaded, user, hasAccess, router])

  // Loading state
  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">
              {!isLoaded ? 'Lade Benutzerdaten...' : 'Lade Guide...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Access denied
  if (!user || !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="glass-card p-8 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">
              Zugriff verweigert
            </h1>
            <p className="text-white/80 mb-4">
              Sie haben keine Berechtigung für den Guide-Editor.
            </p>
            <p className="text-sm text-white/60">
              Kontaktieren Sie den Administrator, um Zugriff zu erhalten.
              <br />
              (Benötigt: author=1 oder admin=1 in Public Metadata)
            </p>
          </div>
        </div>
      </div>
    )
  }

  const addSection = () => {
    const newSection: GuideSection = {
      id: Date.now().toString(),
      type: 'text',
      content: ''
    }
    setSections([...sections, newSection])
  }

  const updateSection = (id: string, content: string) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, content } : section
    ))
  }

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id))
    }
  }

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(section => section.id === id)
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < sections.length - 1)
    ) {
      const newSections = [...sections]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]]
      setSections(newSections)
    }
  }

  const handleOSToggle = (os: string) => {
    setSelectedOS(prev => 
      prev.includes(os) 
        ? prev.filter(item => item !== os)
        : [...prev, os]
    )
  }

  const addCustomOS = () => {
    if (customOS.trim() && !selectedOS.includes(customOS.trim())) {
      setSelectedOS(prev => [...prev, customOS.trim()])
      setCustomOS('')
    }
  }

  const removeCustomOS = (os: string) => {
    setSelectedOS(prev => prev.filter(item => item !== os))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const replacements: { [key: string]: string } = { 'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss' }
        return replacements[match] || match
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || sections.every(s => !s.content.trim())) {
      setError('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    setSaving(true)
    setError(null)

    try {
      const guideData = {
        title: title.trim(),
        description: description.trim(),
        category,
        operatingSystem: selectedOS,
        difficulty,
        readTime: readTime.trim() || 'Unbekannt',
        slug: isEditMode ? originalSlug : generateSlug(title),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sections,
        author: user.fullName || user.firstName || user.emailAddresses[0].emailAddress,
        authorRole: user.publicMetadata?.admin === 1 ? 'Administrator' : 'Author',
        authorImage: user.imageUrl
      }

      const url = isEditMode ? `/api/guides/${originalSlug}` : '/api/guides'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guideData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Speichern')
      }

      // Erfolgreich gespeichert
      const message = isEditMode 
        ? 'Guide erfolgreich aktualisiert!' 
        : `Guide erfolgreich gespeichert!\nSlug: ${result.guide.slug}`
      alert(message)
      
      if (isEditMode) {
        // Zurück zum Guide
        router.push(`/guide/${originalSlug}`)
      } else {
        // Formular zurücksetzen
        setTitle('')
        setDescription('')
        setCategory('Virtualisierung')
        setSelectedOS([])
        setDifficulty('Anfänger')
        setReadTime('')
        setTags('')
        setSections([{ id: '1', type: 'text', content: '' }])
      }
      
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Guides.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getSectionIcon = (type: string) => {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isEditMode ? 'Guide bearbeiten' : 'Guide Editor'}
              </h1>
              <p className="text-white/80">
                {isEditMode ? 'Bearbeite den bestehenden Guide' : 'Erstelle einen neuen Guide für die Community'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-white font-medium">
                  {user.fullName || user.firstName || 'Unbekannt'}
                </p>
                <p className="text-white/60 text-sm">
                  {user.publicMetadata?.admin === 1 ? 'Administrator' : 'Author'}
                </p>
              </div>
              {user.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt="Profilbild" 
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              )}
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Grundinformationen</h2>
          
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Titel *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="z.B. Installation von Proxmox VE..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Beschreibung *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                placeholder="Kurze Beschreibung des Guides..."
              />
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Kategorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  {categories.filter(cat => cat !== 'Alle').map(cat => (
                    <option key={cat} value={cat} className="bg-slate-800 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Schwierigkeit
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'Anfänger' | 'Fortgeschritten' | 'Experte')}
                  className="w-full glass-input px-4 py-3 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  {difficulties.filter(diff => diff !== 'Alle').map(diff => (
                    <option key={diff} value={diff} className="bg-slate-800 text-white">
                      {diff}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Read Time and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Lesezeit
                </label>
                <input
                  type="text"
                  value={readTime}
                  onChange={(e) => setReadTime(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="z.B. 15 Min."
                />
              </div>

              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Tags (kommagetrennt)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="proxmox, virtualisierung, hetzner"
                />
              </div>
            </div>

            {/* Operating Systems */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-3">
                Unterstützte Betriebssysteme
              </label>
              
              {/* Standard Betriebssysteme */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {operatingSystems.filter(os => os !== 'Alle').map(os => (
                  <label key={os} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedOS.includes(os)}
                      onChange={() => handleOSToggle(os)}
                      className="sr-only"
                    />
                    <div className={`flex items-center px-3 py-2 rounded-lg border transition-all duration-300 ${
                      selectedOS.includes(os)
                        ? 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                        : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                    }`}>
                      <span className="text-sm">{os}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Eigenes Betriebssystem hinzufügen */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customOS}
                  onChange={(e) => setCustomOS(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomOS()}
                  className="flex-1 glass-input px-3 py-2 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                  placeholder="Eigenes Betriebssystem hinzufügen..."
                />
                <button
                  type="button"
                  onClick={addCustomOS}
                  className="glass-button text-white px-4 py-2 rounded-lg text-sm transition-all duration-300"
                >
                  Hinzufügen
                </button>
              </div>

              {/* Ausgewählte eigene Betriebssysteme */}
              {selectedOS.filter(os => !operatingSystems.includes(os)).length > 0 && (
                <div className="space-y-2">
                  <p className="text-white/60 text-sm">Eigene Betriebssysteme:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedOS.filter(os => !operatingSystems.includes(os)).map(os => (
                      <div key={os} className="flex items-center bg-blue-500/20 border border-blue-400/50 text-blue-300 px-3 py-1 rounded-lg">
                        <span className="text-sm mr-2">{os}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomOS(os)}
                          className="text-blue-300 hover:text-blue-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Guide Inhalt</h2>
            <div className="flex space-x-2">
              <button
                onClick={addSection}
                className="glass-button text-white px-4 py-2 rounded-lg text-sm transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Sektion hinzufügen
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={section.id} className="border border-white/10 rounded-lg p-4 bg-black/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-white/60">
                      {getSectionIcon(section.type)}
                      <span className="ml-2 text-sm font-medium">
                        Text Sektion {index + 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveSection(section.id, 'up')}
                      disabled={index === 0}
                      className="text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveSection(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className="text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeSection(section.id)}
                      disabled={sections.length === 1}
                      className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content Input */}
                <div>
                  <SimpleTiptapEditor
                    content={section.content}
                    onChange={(content) => updateSection(section.id, content)}
                    placeholder="Schreibe hier deinen Text... Verwende die Toolbar für Code-Blöcke und Pfade."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="glass-button text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 md:hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Aktualisieren...' : 'Speichern...'}
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {isEditMode ? 'Guide aktualisieren' : 'Guide speichern'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}