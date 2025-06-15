import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service')
    const days = parseInt(searchParams.get('days') || '90')

    // Fetch historical data from monitoring server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/status/history?service=${serviceId}&days=${days}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    })

    if (!response.ok) {
      // Return mock data if monitoring server is not available
      return NextResponse.json(generateMockHistoryData(days))
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching status history:', error)
    
    // Return mock data as fallback
    const days = parseInt(new URL(request.url).searchParams.get('days') || '90')
    return NextResponse.json(generateMockHistoryData(days))
  }
}

function generateMockHistoryData(days: number) {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate realistic uptime data
    const random = Math.random()
    let status = 'operational'
    let uptime = 100
    let incidents = 0
    
    if (random < 0.02) { // 2% chance of major outage
      status = 'major_outage'
      uptime = Math.random() * 50 + 20 // 20-70% uptime
      incidents = Math.floor(Math.random() * 3) + 1
    } else if (random < 0.05) { // 3% chance of degraded
      status = 'degraded'
      uptime = Math.random() * 20 + 80 // 80-100% uptime
      incidents = Math.floor(Math.random() * 2)
    } else if (random < 0.07) { // 2% chance of partial outage
      status = 'partial_outage'
      uptime = Math.random() * 30 + 60 // 60-90% uptime
      incidents = Math.floor(Math.random() * 2) + 1
    } else if (random < 0.08) { // 1% chance of maintenance
      status = 'maintenance'
      uptime = 95 + Math.random() * 5 // 95-100% uptime
      incidents = 0
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      status,
      uptime: Math.round(uptime * 100) / 100,
      incidents,
      responseTime: Math.floor(Math.random() * 200) + 50 // 50-250ms
    })
  }
  
  return data
}