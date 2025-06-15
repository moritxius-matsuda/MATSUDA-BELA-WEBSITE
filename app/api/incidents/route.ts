import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'resolved', etc.
    const limit = searchParams.get('limit') || '10'
    const id = searchParams.get('id') // For single incident lookup

    console.log(`Fetching incidents with status: ${status}, limit: ${limit}, id: ${id}`)

    // If ID is provided, fetch single incident
    if (id) {
      const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 30 }
      })

      if (!response.ok) {
        throw new Error(`Monitoring server responded with status: ${response.status}`)
      }

      const data = await response.json()
      console.log(`Retrieved single incident: ${id}`)
      return NextResponse.json(data)
    }

    // Build query parameters for list
    const queryParams = new URLSearchParams()
    if (status) queryParams.append('status', status)
    queryParams.append('limit', limit)

    // Fetch incidents from monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents?${queryParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    })

    if (!response.ok) {
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Received incidents data:`, data)
    console.log(`Number of incidents: ${data.incidents?.length || 0}`)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching incidents:', error)
    
    // Return empty incidents list on error
    return NextResponse.json({
      incidents: [],
      error: 'Failed to fetch incidents from monitoring server',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Creating new incident:', body.title)

    // Forward to monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Incident created:', data.id)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error creating incident:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create incident',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, message, status } = body
    
    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Updating incident ${id} to status ${status}`)

    // Forward to monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ message, status })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Monitoring server error: ${response.status} - ${errorText}`)
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Incident updated:', data.id)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error updating incident:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to update incident',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Incident ID is required' },
        { status: 400 }
      )
    }
    
    console.log(`Deleting incident ${id}`)

    // Forward to monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Monitoring server error: ${response.status} - ${errorText}`)
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    console.log('Incident deleted:', id)
    
    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting incident:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to delete incident',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}