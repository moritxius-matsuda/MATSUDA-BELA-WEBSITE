'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

interface GuideRatingProps {
  guideSlug: string
  inline?: boolean
}

interface Rating {
  totalLikes: number
  totalDislikes: number
  userReaction: 'like' | 'dislike' | null
  ratio: number
}

export default function GuideRating({ guideSlug, inline = false }: GuideRatingProps) {
  const { user, isSignedIn } = useUser()
  const [rating, setRating] = useState<Rating>({
    totalLikes: 0,
    totalDislikes: 0,
    userReaction: null,
    ratio: 0
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Bewertungen laden
  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/guides/${guideSlug}/rating`)
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setRating(data.rating)
          }
        }
      } catch (error) {
        console.error('Error fetching rating:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRating()
  }, [guideSlug])

  // Bewertung abgeben
  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (!isSignedIn) {
      alert('Bitte melden Sie sich an, um zu bewerten.')
      return
    }

    setSubmitting(true)
    try {
      // Wenn bereits die gleiche Reaktion vorhanden ist, entferne sie
      const actualReaction = rating.userReaction === reaction ? 'remove' : reaction

      const response = await fetch(`/api/guides/${guideSlug}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reaction: actualReaction }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRating(data.rating)
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Fehler beim Bewerten')
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Fehler beim Bewerten')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={inline ? "mb-4" : "glass-card p-6 mb-8"}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-32 mb-4"></div>
          <div className="flex gap-4">
            <div className="h-10 bg-white/20 rounded w-20"></div>
            <div className="h-10 bg-white/20 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={inline ? "mb-4" : "glass-card p-6 mb-8"}>
      {!inline && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            War dieser Guide hilfreich?
          </h3>
          {rating.totalLikes + rating.totalDislikes > 0 && (
            <div className="text-sm text-white/70">
              {rating.ratio}% fanden es hilfreich ({rating.totalLikes + rating.totalDislikes} Bewertungen)
            </div>
          )}
        </div>
      )}

      {inline && rating.totalLikes + rating.totalDislikes > 0 && (
        <div className="mb-3">
          <div className="text-sm text-white/70">
            {rating.ratio}% fanden diesen Guide hilfreich ({rating.totalLikes + rating.totalDislikes} Bewertungen)
          </div>
        </div>
      )}

      <div className={`flex items-center gap-4 ${inline ? 'flex-wrap' : ''}`}>
        {/* Like Button */}
        <button
          onClick={() => handleReaction('like')}
          disabled={submitting || !isSignedIn}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            rating.userReaction === 'like'
              ? 'bg-green-500/30 text-green-300 border border-green-400/50'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''} ${
            !isSignedIn ? 'opacity-50 cursor-not-allowed' : ''
          } ${inline ? 'text-sm' : ''}`}
          title={!isSignedIn ? 'Anmelden zum Bewerten' : 'Hilfreich'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-2-2m0 0l-2-2m2 2v6" />
          </svg>
          <span className="font-medium">{rating.totalLikes}</span>
          {!inline && <span className="text-sm">Hilfreich</span>}
        </button>

        {/* Dislike Button */}
        <button
          onClick={() => handleReaction('dislike')}
          disabled={submitting || !isSignedIn}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
            rating.userReaction === 'dislike'
              ? 'bg-red-500/30 text-red-300 border border-red-400/50'
              : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : ''} ${
            !isSignedIn ? 'opacity-50 cursor-not-allowed' : ''
          } ${inline ? 'text-sm' : ''}`}
          title={!isSignedIn ? 'Anmelden zum Bewerten' : 'Nicht hilfreich'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4l2 2m0 0l2 2m-2-2v6" />
          </svg>
          <span className="font-medium">{rating.totalDislikes}</span>
          {!inline && <span className="text-sm">Nicht hilfreich</span>}
        </button>
      </div>

      {!isSignedIn && (
        <p className="text-sm text-white/60 mt-3">
          <a href="/sign-in" className="text-blue-400 hover:text-blue-300 underline">
            Melden Sie sich an
          </a>, um diesen Guide zu bewerten.
        </p>
      )}

      {/* Progress Bar für Verhältnis */}
      {rating.totalLikes + rating.totalDislikes > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/60 mb-1">
            <span>Hilfreich</span>
            <span>Nicht hilfreich</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${rating.ratio}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}