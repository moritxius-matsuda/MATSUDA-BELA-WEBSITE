import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'resolved', etc.
    const limit = searchParams.get('limit') || '10'

    console.log(`Fetching incidents with status: ${status}, limit: ${limit}`)

    // Build query parameters
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