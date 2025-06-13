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

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validierung der erforderlichen Felder
    if (!body.title || !body.description || !body.sections || body.sections.length === 0) {
      return NextResponse.json(
        { error: 'Titel, Beschreibung und mindestens ein Inhaltsabschnitt sind erforderlich' },
        { status: 400 }
      )
    }

    // Lade bestehende Guides
    const existingGuides = await loadAllGuides()
    
    // Erstelle neuen Guide
    const newGuide = {
      id: Date.now().toString(),
      title: body.title.trim(),
      description: body.description.trim(),
      category: body.category,
      operatingSystem: body.operatingSystem || [],
      difficulty: body.difficulty,
      readTime: body.readTime || 'Unbekannt',
      slug: body.slug,
      tags: body.tags || [],
      sections: body.sections,
      author: body.author,
      authorRole: body.authorRole,
      authorImage: body.authorImage,
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    }

    // Prüfe ob Slug bereits existiert
    const slugExists = existingGuides.some((guide: any) => guide.slug === newGuide.slug)
    if (slugExists) {
      return NextResponse.json(
        { error: 'Ein Guide mit diesem Slug existiert bereits' },
        { status: 400 }
      )
    }

    // Füge neuen Guide zur Liste hinzu
    existingGuides.push(newGuide)
    
    // Speichere alle Guides in guides.json
    const saved = await saveAllGuides(existingGuides)
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Guides' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      guide: newGuide,
      message: 'Guide erfolgreich gespeichert'
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const guides = await loadAllGuides()
    return NextResponse.json({ guides })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Guides' },
      { status: 500 }
    )
  }
}