import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching real statistics from monitoring server')

    // Fetch statistics from monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/stats`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    })

    if (!response.ok) {
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received statistics:', data)
    
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching statistics:', error)
    
    // Return error - no fallback data
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics from monitoring server',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}