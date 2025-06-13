'use client'

import { useState, useMemo, useEffect } from 'react'
import GuideCard from '@/components/GuideCard'
import { guides as staticGuides, categories, operatingSystems, difficulties } from '@/data/guides'
import type { Guide } from '@/data/guides'

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Alle')
  const [selectedOS, setSelectedOS] = useState('Alle')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Alle')
  const [allGuides, setAllGuides] = useState<Guide[]>(staticGuides)
  const [loading, setLoading] = useState(true)

  // Lade alle Guides (statische + gespeicherte)
  useEffect(() => {
    const loadAllGuides = async () => {
      try {
        const response = await fetch('/api/guides')
        if (response.ok) {
          const result = await response.json()
          const savedGuides = result.guides || []
          
          // Kombiniere statische und gespeicherte Guides
          const combined = [...staticGuides, ...savedGuides]
          setAllGuides(combined)
        } else {
          // Fallback zu statischen Guides
          setAllGuides(staticGuides)
        }
      } catch (error) {
        console.error('Error loading guides:', error)
        // Fallback zu statischen Guides
        setAllGuides(staticGuides)
      } finally {
        setLoading(false)
      }
    }

    loadAllGuides()
  }, [])

  const filteredGuides = useMemo(() => {
    return allGuides.filter(guide => {
      const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'Alle' || guide.category === selectedCategory
      const matchesOS = selectedOS === 'Alle' || guide.operatingSystem.includes(selectedOS)
      const matchesDifficulty = selectedDifficulty === 'Alle' || guide.difficulty === selectedDifficulty

      return matchesSearch && matchesCategory && matchesOS && matchesDifficulty
    })
  }, [allGuides, searchTerm, selectedCategory, selectedOS, selectedDifficulty])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('Alle')
    setSelectedOS('Alle')
    setSelectedDifficulty('Alle')
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* Header Section */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="mb-6 sm:mb-8">
          <img 
            src="/matsuda-béla-weiß.png" 
            alt="Matsuda Béla Logo" 
            className="w-48 h-auto sm:w-64 md:w-80 lg:w-96 mx-auto opacity-90 md:hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Tech Guides & Tutorials
        </h1>
        <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto">
          Entdecke umfassende Anleitungen für Server-Administration, Virtualisierung und mehr
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="glass-card p-6 mb-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Guides durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full glass-input px-4 py-3 pl-12 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Kategorie</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-slate-800 text-white">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* OS Filter */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Betriebssystem</label>
              <select
                value={selectedOS}
                onChange={(e) => setSelectedOS(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {operatingSystems.map(os => (
                  <option key={os} value={os} className="bg-slate-800 text-white">
                    {os}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">Schwierigkeit</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="bg-slate-800 text-white">
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full glass-button text-white px-4 py-2 rounded-lg transition-all duration-300 md:hover:shadow-lg"
              >
                Filter zurücksetzen
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-white/80">
          {filteredGuides.length} {filteredGuides.length === 1 ? 'Guide' : 'Guides'} gefunden
        </p>
        {(searchTerm || selectedCategory !== 'Alle' || selectedOS !== 'Alle' || selectedDifficulty !== 'Alle') && (
          <button
            onClick={clearFilters}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-300"
          >
            Alle Filter entfernen
          </button>
        )}
      </div>

      {/* Guides Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map(guide => (
            <GuideCard
              key={guide.id}
              title={guide.title}
              description={guide.description}
              category={guide.category}
              operatingSystem={guide.operatingSystem}
              difficulty={guide.difficulty}
              readTime={guide.readTime}
              slug={guide.slug}
              tags={guide.tags}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="glass-card p-8">
            <svg className="w-16 h-16 text-white/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Keine Guides gefunden</h3>
            <p className="text-white/60 mb-4">
              Versuche deine Suchkriterien anzupassen oder die Filter zu ändern.
            </p>
            <button
              onClick={clearFilters}
              className="glass-button text-white px-6 py-2 rounded-lg transition-all duration-300 md:hover:shadow-lg"
            >
              Filter zurücksetzen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}