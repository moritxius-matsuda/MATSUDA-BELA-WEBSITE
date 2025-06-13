import { NextRequest, NextResponse } from 'next/server'

// Lade alle gespeicherten Guides aus Vercel Blob
async function loadGuides() {
  try {
    // Verwende die GET API Route
    const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/guides`)
    
    if (response.ok) {
      const data = await response.json()
      return data.guides || []
    } else {
      return []
    }
  } catch (error) {
    console.error('Error loading guides:', error)
    return []
  }
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

    return NextResponse.json({ guide })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden des Guides' },
      { status: 500 }
    )
  }
}