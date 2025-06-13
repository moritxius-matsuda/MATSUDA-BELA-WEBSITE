import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list } from '@vercel/blob'

// Lade alle individuellen Guide-Dateien
async function loadAllGuides() {
  try {
    const { blobs } = await list({ prefix: 'guide-' })
    const guides = []
    
    for (const blob of blobs) {
      if (blob.pathname.endsWith('.json')) {
        try {
          const response = await fetch(blob.url)
          if (response.ok) {
            const guide = await response.json()
            guides.push(guide)
          }
        } catch (error) {
          console.error(`Error loading guide ${blob.pathname}:`, error)
        }
      }
    }
    
    return guides
  } catch (error) {
    console.error('Error loading guides:', error)
    return []
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

    // Lade bestehende Guides um Slug-Duplikate zu prüfen
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

    // Erstelle nur die individuelle Guide-Datei
    const guideBlob = await put(`guide-${newGuide.slug}.json`, JSON.stringify(newGuide, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

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