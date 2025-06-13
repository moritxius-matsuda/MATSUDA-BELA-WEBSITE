import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const GUIDES_FILE = path.join(process.cwd(), 'data', 'saved-guides.json')

function loadGuides() {
  try {
    if (!fs.existsSync(GUIDES_FILE)) {
      return []
    }
    const data = fs.readFileSync(GUIDES_FILE, 'utf8')
    return JSON.parse(data)
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
    const guides = loadGuides()
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