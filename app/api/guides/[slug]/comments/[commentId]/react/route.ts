import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getComment, updateComment } from '@/lib/storage'

// POST - Like/Dislike für einen Kommentar
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string, commentId: string } }
) {
  try {
    const { userId } = auth()

    const { slug, commentId } = params
    const body = await request.json()
    const { reaction } = body // 'like', 'dislike', oder 'remove'

    if (!['like', 'dislike', 'remove'].includes(reaction)) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Reaktion' },
        { status: 400 }
      )
    }

    const comment = getComment(slug, commentId)

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Kommentar nicht gefunden' },
        { status: 404 }
      )
    }

    // Aktuelle Reaktion des Benutzers
    const currentReaction = comment.userReactions[userId]
    let newLikes = comment.likes
    let newDislikes = comment.dislikes
    const newUserReactions = { ...comment.userReactions }

    // Entferne vorherige Reaktion
    if (currentReaction === 'like') {
      newLikes = Math.max(0, newLikes - 1)
    } else if (currentReaction === 'dislike') {
      newDislikes = Math.max(0, newDislikes - 1)
    }

    // Füge neue Reaktion hinzu (außer bei 'remove')
    if (reaction === 'like' && currentReaction !== 'like') {
      newLikes += 1
      newUserReactions[userId] = 'like'
    } else if (reaction === 'dislike' && currentReaction !== 'dislike') {
      newDislikes += 1
      newUserReactions[userId] = 'dislike'
    } else {
      // Reaktion entfernen
      delete newUserReactions[userId]
    }

    // Kommentar aktualisieren
    updateComment(slug, commentId, {
      likes: newLikes,
      dislikes: newDislikes,
      userReactions: newUserReactions
    })

    return NextResponse.json({
      success: true,
      comment: {
        id: commentId,
        likes: newLikes,
        dislikes: newDislikes,
        userReaction: newUserReactions[userId] || null
      },
      message: 'Reaktion aktualisiert'
    })
  } catch (error) {
    console.error('Error updating comment reaction:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren der Reaktion' },
      { status: 500 }
    )
  }
}