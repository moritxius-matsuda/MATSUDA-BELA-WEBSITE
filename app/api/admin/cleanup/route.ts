import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { list, del } from '@vercel/blob'

// Alle Guide-Dateien löschen
export async function DELETE() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      )
    }

    // Finde alle Guide-Dateien
    const { blobs } = await list({ prefix: 'guide-' })
    
    let deletedCount = 0
    const errors = []

    for (const blob of blobs) {
      try {
        await del(blob.url)
        deletedCount++
        console.log(`Deleted: ${blob.pathname}`)
      } catch (error) {
        console.error(`Error deleting ${blob.pathname}:`, error)
        errors.push(blob.pathname)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} Guide-Dateien gelöscht`,
      deletedCount,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json(
      { error: 'Fehler beim Aufräumen' },
      { status: 500 }
    )
  }
}