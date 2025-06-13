import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { list, del } from '@vercel/blob'

// Alle Blob-Dateien anzeigen
export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { blobs } = await list()
    
    return NextResponse.json({
      success: true,
      blobs: blobs.map(blob => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt
      }))
    })
  } catch (error) {
    console.error('Error listing blobs:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Blob-Dateien' },
      { status: 500 }
    )
  }
}

// Blob-Datei löschen
export async function DELETE(request: Request) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL ist erforderlich' },
        { status: 400 }
      )
    }

    await del(url)
    
    return NextResponse.json({
      success: true,
      message: 'Datei erfolgreich gelöscht'
    })
  } catch (error) {
    console.error('Error deleting blob:', error)
    return NextResponse.json(
      { error: 'Fehler beim Löschen der Datei' },
      { status: 500 }
    )
  }
}