import { NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function GET() {
  try {
    // Hole Daten vom externen Monitoring-Server
    const response = await fetch(`${MONITORING_SERVER_URL}/api/status`, {
      headers: {
        'User-Agent': 'moritxius.de-frontend'
      },
      // Cache für 30 Sekunden
      next: { revalidate: 30 }
    })

    if (!response.ok) {
      throw new Error(`Monitoring server responded with ${response.status}`)
    }

    const statusData = await response.json()
    return NextResponse.json(statusData)
  } catch (error) {
    console.error('Error fetching status from monitoring server:', error)
    
    // Fallback zu Mock-Daten wenn Monitoring-Server nicht erreichbar ist
    const fallbackData = {
      overall: 'major_outage',
      categories: [{
        id: 'monitoring',
        name: 'Monitoring System',
        description: 'Status-Überwachung',
        services: [{
          id: 'monitoring-server',
          name: 'Monitoring Server',
          description: 'Externer Status-Monitoring-Server',
          status: 'major_outage',
          category: 'monitoring',
          lastChecked: new Date().toISOString(),
          errorMessage: 'Monitoring-Server nicht erreichbar'
        }]
      }],
      incidents: [{
        id: 'monitoring-outage',
        title: 'Monitoring-Server nicht erreichbar',
        description: 'Der externe Monitoring-Server ist derzeit nicht erreichbar.',
        status: 'investigating',
        impact: 'minor',
        affectedServices: ['monitoring-server'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updates: [{
          id: 'update-1',
          message: 'Monitoring-Server ist nicht erreichbar. Status-Informationen können nicht abgerufen werden.',
          status: 'investigating',
          timestamp: new Date().toISOString()
        }]
      }],
      maintenance: [],
      lastUpdated: new Date().toISOString()
    }
    
    return NextResponse.json(fallbackData)
  }
}

// Endpoint für nur den Overall-Status (für Navbar)
export async function HEAD() {
  try {
    const overallStatus = getOverallStatus(mockStatusData.categories)
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Overall-Status': overallStatus,
        'X-Last-Updated': new Date().toISOString()
      }
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}