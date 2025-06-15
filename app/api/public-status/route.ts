import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Fetch current active incidents
    const incidentsResponse = await fetch(`${MONITORING_SERVER_URL}/api/incidents?status=active&limit=5`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    })

    let incidents = []
    if (incidentsResponse.ok) {
      const incidentsData = await incidentsResponse.json()
      incidents = incidentsData.incidents || []
    }

    // Determine overall status based on incidents
    let overallStatus = 'operational'
    if (incidents.length > 0) {
      const highestImpact = incidents.reduce((highest: string, incident: any) => {
        const impactLevels = { 'minor': 1, 'major': 2, 'critical': 3 }
        const currentLevel = impactLevels[incident.impact as keyof typeof impactLevels] || 0
        const highestLevel = impactLevels[highest as keyof typeof impactLevels] || 0
        return currentLevel > highestLevel ? incident.impact : highest
      }, 'minor')

      switch (highestImpact) {
        case 'critical':
          overallStatus = 'major_outage'
          break
        case 'major':
          overallStatus = 'partial_outage'
          break
        case 'minor':
          overallStatus = 'degraded'
          break
        default:
          overallStatus = 'operational'
      }
    }

    // Fetch basic stats
    let stats = {
      uptime: 99.9,
      avgResponseTime: 150,
      totalIncidents: 0,
      resolvedIncidents: 0
    }

    try {
      const statsResponse = await fetch(`${MONITORING_SERVER_URL}/api/stats`, {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache for 5 minutes
      })

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        stats = { ...stats, ...statsData }
      }
    } catch (error) {
      console.warn('Could not fetch stats:', error)
    }

    const response = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      incidents: incidents.slice(0, 3), // Only return top 3 incidents
      stats,
      message: incidents.length > 0 
        ? `${incidents.length} aktive${incidents.length === 1 ? 'r' : ''} Vorfall${incidents.length === 1 ? '' : 'e'}`
        : 'Alle Systeme betriebsbereit'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching public status:', error)
    
    // Return minimal status on error
    return NextResponse.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      incidents: [],
      stats: {
        uptime: 99.9,
        avgResponseTime: 150,
        totalIncidents: 0,
        resolvedIncidents: 0
      },
      message: 'Status wird geladen...',
      error: 'Could not fetch complete status information'
    })
  }
}