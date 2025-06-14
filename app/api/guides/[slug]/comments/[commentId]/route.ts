import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs'
import { getComment, updateComment, deleteComment } from '@/lib/kv-storage'
import { canDeleteComment, canEditComment } from '@/lib/admin'

// PUT - Kommentar bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string, commentId: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentifizierung erforderlich' },
        { status: 401 }
      )
    }

    const { slug, commentId } = params
    const body = await request.json()
    const { content } = body

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

    const comment = await getComment(slug, commentId)

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Kommentar nicht gefunden' },
        { status: 404 }
      )
    }

    // Überprüfen, ob der Benutzer berechtigt ist, den Kommentar zu bearbeiten
    if (!canEditComment(userId, comment.userId)) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung zum Bearbeiten dieses Kommentars' },
        { status: 403 }
      )
    }

    // Kommentar aktualisieren
    const success = await updateComment(slug, commentId, {
      content: content.trim(),
      updatedAt: new Date().toISOString()
    })

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Fehler beim Aktualisieren des Kommentars' },
        { status: 500 }
      )
    }

    const updatedComment = await getComment(slug, commentId)

    return NextResponse.json({
      success: true,
      comment: updatedComment,
      message: 'Kommentar erfolgreich aktualisiert'
    })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Kommentars' },
      { status: 500 }
    )
  }
}

// DELETE - Kommentar löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string, commentId: string } }
) {
  try {
    const { userId } = auth()
    const user = await currentUser()
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentifizierung erforderlich' },
        { status: 401 }
      )
    }

    const { slug, commentId } = params
    const comment = await getComment(slug, commentId)

    if (!comment) {
      return NextResponse.json(
        { success: false, error: 'Kommentar nicht gefunden' },
        { status: 404 }
      )
    }

    // Überprüfen, ob der Benutzer berechtigt ist, den Kommentar zu löschen
    const userEmail = user?.emailAddresses?.[0]?.emailAddress
    if (!canDeleteComment(userId, userEmail, comment.userId)) {
      return NextResponse.json(
        { success: false, error: 'Keine Berechtigung zum Löschen dieses Kommentars' },
        { status: 403 }
      )
    }

    // Kommentar löschen
    const success = await deleteComment(slug, commentId)
    
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Fehler beim Löschen des Kommentars' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kommentar erfolgreich gelöscht'
    })
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Löschen des Kommentars' },
      { status: 500 }
    )
  }
}