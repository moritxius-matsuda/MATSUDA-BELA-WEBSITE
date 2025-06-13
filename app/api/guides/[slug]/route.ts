import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list } from '@vercel/blob'

const GUIDES_FILENAME = 'guides.json'

// Lade alle Guides aus der zentralen guides.json
async function loadAllGuides() {
  try {
    const { blobs } = await list()
    const guidesBlob = blobs.find(blob => blob.pathname === GUIDES_FILENAME)
    
    if (guidesBlob) {
      const response = await fetch(guidesBlob.url)
      if (response.ok) {
        const data = await response.json()
        return data.guides || []
      }
    }
    
    return []
  } catch (error) {
    console.error('Error loading guides:', error)
    return []
  }
}

// Speichere alle Guides in der zentralen guides.json
async function saveAllGuides(guides: any[]) {
  try {
    const blob = await put(GUIDES_FILENAME, JSON.stringify({ guides }, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })
    
    return blob
  } catch (error) {
    console.error('Error saving guides:', error)
    return null
  }
}

// Lade einen spezifischen Guide
async function loadGuide(slug: string) {
  try {
    const guides = await loadAllGuides()
    return guides.find((guide: any) => guide.slug === slug) || null
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

    // Lade alle Guides
    const allGuides = await loadAllGuides()
    const guideIndex = allGuides.findIndex((g: any) => g.slug === existingGuide.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht in der Liste gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob neuer Slug bereits existiert (falls geändert)
    if (body.slug && body.slug !== existingGuide.slug) {
      const slugExists = allGuides.some((guide: any, index: number) => 
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

    // Aktualisiere den Guide in der Liste
    allGuides[guideIndex] = updatedGuide
    
    // Speichere alle Guides
    const saved = await saveAllGuides(allGuides)
    
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

    // Lade alle Guides
    const allGuides = await loadAllGuides()
    const guideIndex = allGuides.findIndex((g: any) => g.slug === existingGuide.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht in der Liste gefunden' },
        { status: 404 }
      )
    }

    // Entferne den Guide aus der Liste
    allGuides.splice(guideIndex, 1)
    
    // Speichere alle Guides
    const saved = await saveAllGuides(allGuides)
    
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