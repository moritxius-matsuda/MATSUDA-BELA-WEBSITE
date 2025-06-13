import { NextRequest, NextResponse } from 'next/server'
import { list } from '@vercel/blob'

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