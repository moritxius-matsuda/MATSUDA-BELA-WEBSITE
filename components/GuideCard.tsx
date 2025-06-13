'use client'

import Link from 'next/link'

interface GuideCardProps {
  title: string
  description: string
  category: string
  operatingSystem: string[]
  difficulty: 'Anfänger' | 'Fortgeschritten' | 'Experte'
  readTime: string
  slug: string
  tags: string[]
}

export default function GuideCard({ 
  title, 
  description, 
  category, 
  operatingSystem, 
  difficulty, 
  readTime, 
  slug, 
  tags 
}: GuideCardProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Anfänger':
        return 'text-green-400 bg-green-400/20 border-green-400/30'
      case 'Fortgeschritten':
        return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
      case 'Experte':
        return 'text-red-400 bg-red-400/20 border-red-400/30'
      default:
        return 'text-gray-400 bg-gray-400/20 border-gray-400/30'
    }
  }

  return (
    <Link href={`/${slug}`}>
      <div className="glass-card p-6 h-full md:hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                {title}
              </h3>
              <p className="text-sm text-blue-300 font-medium mb-2">
                {category}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </div>
          </div>

          {/* Description */}
          <p className="text-white/80 text-sm mb-4 flex-1 line-clamp-3">
            {description}
          </p>

          {/* Operating Systems */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {operatingSystem.map((os, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-md border border-purple-400/30"
                >
                  {os}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-md"
                >
                  #{tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded-md">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-xs text-white/60 mt-auto">
            <span>📖 {readTime}</span>
            <span className="flex items-center">
              Mehr lesen
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}