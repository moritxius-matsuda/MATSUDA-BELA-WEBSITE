'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { categories, operatingSystems, difficulties } from '@/data/guides'
import RichTextEditor from '@/components/RichTextEditor'

interface GuideSection {
  id: string
  type: 'text' | 'code' | 'path'
  content: string
}

export default function GuideEditorPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  
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
  const [error, setError] = useState<string | null>(null)

  // Check permissions
  const hasAccess = user?.publicMetadata?.author === 1 || user?.publicMetadata?.admin === 1

  useEffect(() => {
    if (!isLoaded) return

    if (!user || !hasAccess) {
      router.push('/sign-in')
      return
    }
  }, [isLoaded, user, hasAccess, router])

  // Loading state
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

  const addSection = (type: 'text' | 'code' | 'path') => {
    const newSection: GuideSection = {
      id: Date.now().toString(),
      type,
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
        slug: generateSlug(title),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        sections,
        author: user.fullName || user.firstName || user.emailAddresses[0].emailAddress,
        authorRole: user.publicMetadata?.admin === 1 ? 'Administrator' : 'Author',
        authorImage: user.imageUrl
      }

      const response = await fetch('/api/guides', {
        method: 'POST',
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
      alert(`Guide erfolgreich gespeichert!\nSlug: ${result.guide.slug}`)
      
      // Formular zurücksetzen
      setTitle('')
      setDescription('')
      setCategory('Virtualisierung')
      setSelectedOS([])
      setDifficulty('Anfänger')
      setReadTime('')
      setTags('')
      setSections([{ id: '1', type: 'text', content: '' }])
      
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern des Guides.')
      console.error('Save error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      case 'code':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        )
      case 'path':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Guide Editor
              </h1>
              <p className="text-white/80">
                Erstelle einen neuen Guide für die Community
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
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
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Eigenes Betriebssystem hinzufügen..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const newOS = e.currentTarget.value.trim()
                      if (!selectedOS.includes(newOS)) {
                        setSelectedOS(prev => [...prev, newOS])
                      }
                      e.currentTarget.value = ''
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
              
              {/* Ausgewählte Betriebssysteme anzeigen */}
              {selectedOS.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedOS.map((os) => (
                      <span
                        key={os}
                        className="inline-flex items-center px-2 py-1 bg-purple-500/20 border border-purple-400/50 text-purple-300 text-xs rounded"
                      >
                        {os}
                        <button
                          type="button"
                          onClick={() => setSelectedOS(prev => prev.filter(item => item !== os))}
                          className="ml-1 text-purple-300 hover:text-purple-100"
                        >
                          ×
                        </button>
                      </span>
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
                onClick={() => addSection('text')}
                className="glass-button text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Text
              </button>
              <button
                onClick={() => addSection('code')}
                className="glass-button text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Code
              </button>
              <button
                onClick={() => addSection('path')}
                className="glass-button text-white px-3 py-2 rounded-lg text-sm transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Pfad
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
                      <span className="ml-2 text-sm font-medium capitalize">
                        {section.type === 'text' ? 'Text' : section.type === 'code' ? 'Code' : 'Pfad'}
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

                {section.type === 'text' ? (
                  <div className="bg-white rounded-lg">
                    <RichTextEditor
                      value={section.content}
                      onChange={(content) => updateSection(section.id, content)}
                      placeholder="Schreibe hier deinen Text..."
                      className="min-h-[200px]"
                    />
                  </div>
                ) : (
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    rows={section.type === 'code' ? 8 : 2}
                    className={`w-full glass-input px-4 py-3 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none ${
                      section.type === 'code' ? 'font-mono text-sm' : ''
                    }`}
                    placeholder={
                      section.type === 'code'
                        ? 'Füge hier deinen Code ein...'
                        : 'z.B. /etc/network/interfaces'
                    }
                  />
                )}
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
                Speichern...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Guide speichern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}