import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import fs from 'fs'
import path from 'path'

const GUIDES_FILE = path.join(process.cwd(), 'data', 'saved-guides.json')

// Stelle sicher, dass die Datei existiert
function ensureGuidesFile() {
  const dir = path.dirname(GUIDES_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  if (!fs.existsSync(GUIDES_FILE)) {
    fs.writeFileSync(GUIDES_FILE, JSON.stringify([], null, 2))
  }
}

// Lade alle gespeicherten Guides
function loadGuides() {
  ensureGuidesFile()
  try {
    const data = fs.readFileSync(GUIDES_FILE, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading guides:', error)
    return []
  }
}

// Speichere Guides
function saveGuides(guides: any[]) {
  ensureGuidesFile()
  try {
    fs.writeFileSync(GUIDES_FILE, JSON.stringify(guides, null, 2))
    return true
  } catch (error) {
    console.error('Error saving guides:', error)
    return false
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
    const existingGuides = loadGuides()
    
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
    const saved = saveGuides(existingGuides)
    
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
    const guides = loadGuides()
    return NextResponse.json({ guides })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Laden der Guides' },
      { status: 500 }
    )
  }
}