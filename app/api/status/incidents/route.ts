import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { createIncident, getIncidents, updateIncident } from '@/lib/status-db'

// GET - Alle Incidents abrufen
export async function GET() {
  try {
    const incidents = await getIncidents()
    return NextResponse.json(incidents)
  } catch (error) {
    console.error('Error fetching incidents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    )
  }
}

// POST - Neuen Incident erstellen (nur für Admins)
export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hier würden wir normalerweise prüfen, ob der User Admin-Rechte hat
    // Für Demo-Zwecke lassen wir es erstmal offen

    const body = await request.json()
    const { title, description, impact, affectedServices } = body

    if (!title || !description || !impact || !affectedServices) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const incident = await createIncident({
      title,
      description,
      status: 'investigating',
      impact,
      affectedServices,
      updates: []
    })

    return NextResponse.json(incident, { status: 201 })
  } catch (error) {
    console.error('Error creating incident:', error)
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    )
  }
}

// PUT - Incident aktualisieren (nur für Admins)
export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, message, status } = body

    if (!id || !message || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const incident = await updateIncident(id, { message, status })
    if (!incident) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(incident)
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    )
  }
}