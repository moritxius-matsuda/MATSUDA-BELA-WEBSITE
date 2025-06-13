import { NextRequest, NextResponse } from 'next/server'
import { list, put } from '@vercel/blob'
import { auth } from '@clerk/nextjs'

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

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('Looking for guide with slug:', params.slug)
    const guides = await loadGuides()
    console.log('Loaded guides:', guides.length, 'guides found')
    console.log('Available slugs:', guides.map((g: any) => g.slug))
    
    const guide = guides.find((g: any) => g.slug === params.slug)
    
    if (!guide) {
      console.log('Guide not found for slug:', params.slug)
      return NextResponse.json(
        { 
          error: 'Guide nicht gefunden',
          requestedSlug: params.slug,
          availableSlugs: guides.map((g: any) => g.slug)
        },
        { status: 404 }
      )
    }

    console.log('Guide found:', guide.title)
    return NextResponse.json({ guide })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Guides' },
      { status: 500 }
    )
  }
}

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

    // Lade alle Guides
    const guides = await loadGuides()
    const guideIndex = guides.findIndex((g: any) => g.slug === params.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    const guide = guides[guideIndex]
    
    // Prüfe Berechtigung (Admin oder Autor)
    if (guide.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Löschen' },
        { status: 403 }
      )
    }

    // Entferne Guide aus Array
    guides.splice(guideIndex, 1)
    
    // Speichere aktualisierte Liste
    await put(BLOB_FILENAME, JSON.stringify({ guides }, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Guide erfolgreich gelöscht' 
    })
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Guides' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()

    // Lade alle Guides
    const guides = await loadGuides()
    const guideIndex = guides.findIndex((g: any) => g.slug === params.slug)
    
    if (guideIndex === -1) {
      return NextResponse.json(
        { error: 'Guide nicht gefunden' },
        { status: 404 }
      )
    }

    const existingGuide = guides[guideIndex]
    
    // Prüfe Berechtigung (Admin oder Autor)
    if (existingGuide.createdBy !== userId) {
      return NextResponse.json(
        { error: 'Keine Berechtigung zum Bearbeiten' },
        { status: 403 }
      )
    }

    // Aktualisiere Guide
    const updatedGuide = {
      ...existingGuide,
      title: body.title || existingGuide.title,
      description: body.description || existingGuide.description,
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

    // Ersetze Guide im Array
    guides[guideIndex] = updatedGuide
    
    // Speichere aktualisierte Liste
    await put(BLOB_FILENAME, JSON.stringify({ guides }, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })

    return NextResponse.json({ 
      success: true, 
      guide: updatedGuide,
      message: 'Guide erfolgreich aktualisiert' 
    })
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Guides' },
      { status: 500 }
    )
  }
}