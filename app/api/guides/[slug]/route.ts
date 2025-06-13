import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list, del } from '@vercel/blob'

// Lade einen spezifischen Guide
async function loadGuide(slug: string) {
  try {
    const { blobs } = await list({ prefix: `guide-${slug}.json` })
    
    if (blobs.length > 0) {
      const response = await fetch(blobs[0].url)
      if (response.ok) {
        return await response.json()
      }
    }
    
    return null
  } catch (error) {
    console.error('Error loading guide:', error)
    return null
  }
}

// Prüfe ob der Benutzer berechtigt ist, den Guide zu bearbeiten
async function canEditGuide(guide: any, userId: string): Promise<boolean> {
  try {
    // Hole Benutzerinformationen von Clerk
    const { clerkClient } = await import('@clerk/nextjs/server')
    const user = await clerkClient.users.getUser(userId)
    
    // Admin-Check über Clerk Metadaten
    const isAdmin = user.publicMetadata?.admin === 1
    const isAuthor = user.publicMetadata?.author === 1
    const isCreator = guide.createdBy === userId
    
    // Admin kann alles bearbeiten, Author kann nur eigene Guides bearbeiten
    return isAdmin || (isAuthor && isCreator)
  } catch (error) {
    console.error('Error checking edit permissions:', error)
    return false
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const guide = await loadGuide(params.slug)
    
    if (!guide) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    // Füge Bearbeitungsberechtigung hinzu
    const { userId } = auth()
    const canEdit = userId ? await canEditGuide(guide, userId) : false

    return NextResponse.json({ 
      guide: {
        ...guide,
        canEdit
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Guides' },
      { status: 500 }
    )
  }
}

// Guide bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const existingGuide = await loadGuide(params.slug)
    
    if (!existingGuide) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }
    
    // Prüfe Berechtigung
    if (!(await canEditGuide(existingGuide, userId))) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Bearbeiten dieses Guides' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validierung der erforderlichen Felder
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Titel und Beschreibung sind erforderlich' },
        { status: 400 }
      )
    }

    // Aktualisiere den Guide
    const updatedGuide = {
      ...existingGuide,
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category || existingGuide.category,
      operatingSystem: body.operatingSystem || existingGuide.operatingSystem,
      difficulty: body.difficulty || existingGuide.difficulty,
      readTime: body.readTime || existingGuide.readTime,
      tags: body.tags || existingGuide.tags,
      sections: body.sections || existingGuide.sections,
      author: body.author || existingGuide.author,
      authorRole: body.authorRole || existingGuide.authorRole,
      authorImage: body.authorImage || existingGuide.authorImage,
      updatedAt: new Date().toISOString()
    }

    // Prüfe ob neuer Slug bereits existiert (falls geändert)
    if (body.slug && body.slug !== existingGuide.slug) {
      const { blobs } = await list({ prefix: `guide-${body.slug}.json` })
      if (blobs.length > 0) {
        return NextResponse.json(
          { error: 'Ein Guide mit diesem Slug existiert bereits' },
          { status: 400 }
        )
      }
      updatedGuide.slug = body.slug
      
      // Lösche die alte Datei
      const { blobs: oldBlobs } = await list({ prefix: `guide-${existingGuide.slug}.json` })
      if (oldBlobs.length > 0) {
        await del(oldBlobs[0].url)
      }
    }

    // Überschreibe die Guide-Datei
    await put(`guide-${updatedGuide.slug}.json`, JSON.stringify(updatedGuide, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    return NextResponse.json({
      success: true,
      guide: updatedGuide,
      message: 'Guide erfolgreich aktualisiert'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

// Guide löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const existingGuide = await loadGuide(params.slug)
    
    if (!existingGuide) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }
    
    // Prüfe Berechtigung
    if (!(await canEditGuide(existingGuide, userId))) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Löschen dieses Guides' },
        { status: 403 }
      )
    }

    // Lösche die Guide-Datei
    const { blobs } = await list({ prefix: `guide-${existingGuide.slug}.json` })
    
    if (blobs.length > 0) {
      await del(blobs[0].url)
    }

    return NextResponse.json({
      success: true,
      message: 'Guide erfolgreich gelöscht'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}