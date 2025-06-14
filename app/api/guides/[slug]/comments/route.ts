import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { getComments, addComment, type Comment } from '@/lib/storage'

// GET - Kommentare für einen Guide abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    const slug = params.slug
    const guideComments = getComments(slug)
    
    // Sortiere Kommentare nach Datum (neueste zuerst)
    const sortedComments = guideComments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Füge userReaction für jeden Kommentar hinzu
    const commentsWithUserReaction = sortedComments.map(comment => ({
      ...comment,
      userReaction: userId ? (comment.userReactions[userId] || null) : null
    }))

    return NextResponse.json({
      success: true,
      comments: commentsWithUserReaction,
      count: commentsWithUserReaction.length
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Laden der Kommentare' },
      { status: 500 }
    )
  }
}

// POST - Neuen Kommentar hinzufügen
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentifizierung erforderlich' },
        { status: 401 }
      )
    }

    const slug = params.slug
    const body = await request.json()
    const { content, userName, userImage, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Kommentar darf nicht leer sein' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Kommentar ist zu lang (max. 1000 Zeichen)' },
        { status: 400 }
      )
    }

    // Überprüfe ob parentId existiert (falls es eine Antwort ist)
    if (parentId) {
      const parentComment = getComment(slug, parentId)
      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: 'Eltern-Kommentar nicht gefunden' },
          { status: 404 }
        )
      }
    }

    const newComment: Comment = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      guideSlug: slug,
      userId,
      userName: userName || 'Anonymer Benutzer',
      userImage,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      userReactions: {},
      parentId: parentId || undefined,
      replies: [],
      replyCount: 0
    }

    // Kommentar zur Liste hinzufügen
    addComment(slug, newComment)

    return NextResponse.json({
      success: true,
      comment: newComment,
      message: 'Kommentar erfolgreich hinzugefügt'
    })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Erstellen des Kommentars' },
      { status: 500 }
    )
  }
}