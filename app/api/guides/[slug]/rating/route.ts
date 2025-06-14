import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getRating, updateRating, type GuideRating } from '@/lib/storage'

// GET - Bewertungen für einen Guide abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    const slug = params.slug
    
    const rating = getRating(slug)

    return NextResponse.json({
      success: true,
      rating: {
        totalLikes: rating.totalLikes,
        totalDislikes: rating.totalDislikes,
        userReaction: (() => {
          const userKey = userId || `anonymous_${request.ip || request.headers.get('x-forwarded-for') || 'unknown'}`
          return rating.userReactions[userKey] || null
        })(),
        ratio: rating.totalLikes + rating.totalDislikes > 0 
          ? Math.round((rating.totalLikes / (rating.totalLikes + rating.totalDislikes)) * 100)
          : 0
      }
    })
  } catch (error) {
    console.error('Error fetching guide rating:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Bewertung' },
      { status: 500 }
    )
  }
}

// POST - Guide bewerten (Like/Dislike)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    
    // Verwende userId oder eine Session-ID für anonyme Benutzer
    const userKey = userId || `anonymous_${request.ip || request.headers.get('x-forwarded-for') || 'unknown'}`

    const slug = params.slug
    const body = await request.json()
    const { reaction } = body // 'like', 'dislike', oder 'remove'

    if (!['like', 'dislike', 'remove'].includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Reaktion' },
        { status: 400 }
      )
    }

    const rating = getRating(slug)
    const currentReaction = rating.userReactions[userKey]
    
    let newTotalLikes = rating.totalLikes
    let newTotalDislikes = rating.totalDislikes
    const newUserReactions = { ...rating.userReactions }

    // Entferne vorherige Reaktion
    if (currentReaction === 'like') {
      newTotalLikes = Math.max(0, newTotalLikes - 1)
    } else if (currentReaction === 'dislike') {
      newTotalDislikes = Math.max(0, newTotalDislikes - 1)
    }

    // Füge neue Reaktion hinzu (außer bei 'remove')
    if (reaction === 'like' && currentReaction !== 'like') {
      newTotalLikes += 1
      newUserReactions[userKey] = 'like'
    } else if (reaction === 'dislike' && currentReaction !== 'dislike') {
      newTotalDislikes += 1
      newUserReactions[userKey] = 'dislike'
    } else {
      // Reaktion entfernen
      delete newUserReactions[userKey]
    }

    // Rating aktualisieren
    updateRating(slug, {
      totalLikes: newTotalLikes,
      totalDislikes: newTotalDislikes,
      userReactions: newUserReactions
    })

    const newRatio = newTotalLikes + newTotalDislikes > 0 
      ? Math.round((newTotalLikes / (newTotalLikes + newTotalDislikes)) * 100)
      : 0

    return NextResponse.json({
      success: true,
      rating: {
        totalLikes: newTotalLikes,
        totalDislikes: newTotalDislikes,
        userReaction: newUserReactions[userKey] || null,
        ratio: newRatio
      },
      message: 'Bewertung aktualisiert'
    })
  } catch (error) {
    console.error('Error updating guide rating:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Bewertung' },
      { status: 500 }
    )
  }
}