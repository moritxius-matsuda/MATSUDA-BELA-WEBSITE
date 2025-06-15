import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service') || 'all'
    const days = parseInt(searchParams.get('days') || '90')

    console.log(`Fetching history for service: ${serviceId}, days: ${days}`)

    // Fetch from monitoring server - NO FALLBACK TO MOCK DATA
    const monitoringUrl = `${MONITORING_SERVER_URL}/api/history?service=${serviceId}&days=${days}`
    console.log(`Fetching from: ${monitoringUrl}`)
    
    const response = await fetch(monitoringUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute only for real data
    })

    if (!response.ok) {
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Received ${data.length} history records from monitoring server`)
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error in history API:', error)
    
    // Return error - NO MOCK DATA FALLBACK
    return NextResponse.json(
      { 
        error: 'Failed to fetch history data from monitoring server',
        details: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

// No mock data - only real data from monitoring server