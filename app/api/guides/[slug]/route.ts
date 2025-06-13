import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list } from '@vercel/blob'

const BLOB_FILENAME = 'guides.json'

// Lade alle gespeicherten Guides aus Vercel Blob
async function loadGuides() {
  try {
    // Liste alle Blobs auf
    const { blobs } = await list()
    const guidesBlob = blobs.find(blob => blob.pathname === BLOB_FILENAME)
    
    if (guidesBlob) {
      // Lade den Inhalt des Blobs
      const response = await fetch(guidesBlob.url)
      if (response.ok) {
        const data = await response.json()
        return data.guides || []
      }
    }
    
    return []
  } catch (error) {
    console.error('Error loading guides from blob:', error)
    return []
  }
}

// Speichere Guides in Vercel Blob
async function saveGuides(guides: any[]) {
  try {
    const blob = await put(BLOB_FILENAME, JSON.stringify({ guides }, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })
    
    return blob
  } catch (error) {
    console.error('Error saving guides to blob:', error)
    return null
  }
}

// Prüfe ob der Benutzer berechtigt ist, den Guide zu bearbeiten
function canEditGuide(guide: any, userId: string): boolean {
  // Admin-Check (hier können Sie spezifische Admin-User-IDs hinzufügen)
  const adminUserIds = [
    // Fügen Sie hier Admin-User-IDs hinzu
    // 'user_admin_id_1',
    // 'user_admin_id_2'
  ]
  
  // Benutzer ist Admin oder Autor des Guides
  return adminUserIds.includes(userId) || guide.createdBy === userId
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const guides = await loadGuides()
    const guide = guides.find((g: any) => g.slug === params.slug)
    
    if (!guide) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    // Füge Bearbeitungsberechtigung hinzu
    const { userId } = auth()
    const canEdit = userId ? canEditGuide(guide, userId) : false

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

    const guides = await loadGuides()
    const guideIndex = guides.findIndex((g: any) => g.slug === params.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    const existingGuide = guides[guideIndex]
    
    // Prüfe Berechtigung
    if (!canEditGuide(existingGuide, userId)) {
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
      const slugExists = guides.some((guide: any, index: number) => 
        guide.slug === body.slug && index !== guideIndex
      )
      if (slugExists) {
        return NextResponse.json(
          { error: 'Ein Guide mit diesem Slug existiert bereits' },
          { status: 400 }
        )
      }
      updatedGuide.slug = body.slug
    }

    guides[guideIndex] = updatedGuide
    
    // Speichere alle Guides
    const saved = await saveGuides(guides)
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Guides' },
        { status: 500 }
      )
    }

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

    const guides = await loadGuides()
    const guideIndex = guides.findIndex((g: any) => g.slug === params.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    const existingGuide = guides[guideIndex]
    
    // Prüfe Berechtigung
    if (!canEditGuide(existingGuide, userId)) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Löschen dieses Guides' },
        { status: 403 }
      )
    }

    // Entferne den Guide
    guides.splice(guideIndex, 1)
    
    // Speichere alle Guides
    const saved = await saveGuides(guides)
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Guides' },
        { status: 500 }
      )
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