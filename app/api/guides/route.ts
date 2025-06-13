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
    const existingGuides = await loadGuides()
    
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
      // Füge Nummer zum Slug hinzu
      let counter = 1
      let newSlug = `${newGuide.slug}-${counter}`
      while (existingGuides.some((guide: any) => guide.slug === newSlug)) {
        counter++
        newSlug = `${newGuide.slug}-${counter}`
      }
      newGuide.slug = newSlug
    }

    // Füge neuen Guide hinzu
    existingGuides.push(newGuide)
    
    // Speichere alle Guides
    const saved = await saveGuides(existingGuides)
    
    if (!saved) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Guides' },
        { status: 500 }
      )
    }

    // Speichere auch die individuelle Guide-Datei
    try {
      const individualGuideBlob = await put(`guide-${newGuide.slug}.json`, JSON.stringify(newGuide, null, 2), {
        access: 'public',
        contentType: 'application/json'
      })
      console.log('Individual guide file created:', individualGuideBlob.url)
    } catch (error) {
      console.error('Error creating individual guide file:', error)
      // Nicht kritisch, da der Guide in der Hauptliste gespeichert wurde
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
    const guides = await loadGuides()
    return NextResponse.json({ guides })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Guides' },
      { status: 500 }
    )
  }
}