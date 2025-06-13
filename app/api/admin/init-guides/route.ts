import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list } from '@vercel/blob'

const GUIDES_FILENAME = 'guides.json'

export async function POST() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Prüfe ob guides.json bereits existiert
    const { blobs } = await list()
    const guidesBlob = blobs.find(blob => blob.pathname === GUIDES_FILENAME)
    
    if (guidesBlob) {
      return NextResponse.json({
        success: true,
        message: 'guides.json existiert bereits',
        url: guidesBlob.url
      })
    }
    
    // Erstelle leere guides.json
    const blob = await put(GUIDES_FILENAME, JSON.stringify({ guides: [] }, null, 2), {
      access: 'public',
      contentType: 'application/json'
    })
    
    return NextResponse.json({
      success: true,
      message: 'guides.json erfolgreich erstellt',
      url: blob.url
    })
  } catch (error) {
    console.error('Error initializing guides.json:', error)
    return NextResponse.json(
      { error: 'Fehler beim Initialisieren der guides.json' },
      { status: 500 }
    )
  }
}