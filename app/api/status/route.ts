import { NextResponse } from 'next/server'
import { mockStatusData, getOverallStatus } from '@/lib/status-data'
import { getIncidents, getMaintenance, getServiceStatuses } from '@/lib/status-db'

// Simuliere echte Service-Checks
async function checkServiceHealth(url?: string): Promise<{ status: 'operational' | 'degraded' | 'major_outage', responseTime?: number }> {
  // Für Demo-Zwecke geben wir immer 'operational' zurück
  // In einer echten Implementierung würden hier echte Health-Checks stattfinden
  return { 
    status: 'operational', 
    responseTime: Math.floor(Math.random() * 300) + 50 // 50-350ms
  }
}

export async function GET() {
  try {
    // Hole echte Daten aus der Datenbank
    const [incidents, maintenance, serviceStatuses] = await Promise.all([
      getIncidents(),
      getMaintenance(),
      getServiceStatuses()
    ])

    // Simuliere Live-Service-Checks und merge mit gespeicherten Daten
    const updatedCategories = await Promise.all(
      mockStatusData.categories.map(async (category) => {
        const updatedServices = await Promise.all(
          category.services.map(async (service) => {
            const savedStatus = serviceStatuses[service.id]
            const healthCheck = await checkServiceHealth(service.url)
            
            return {
              ...service,
              status: savedStatus?.status || healthCheck.status,
              responseTime: savedStatus?.responseTime || healthCheck.responseTime,
              lastChecked: savedStatus?.lastChecked || new Date().toISOString()
            }
          })
        )
        
        return {
          ...category,
          services: updatedServices
        }
      })
    )

    const updatedStatusData = {
      ...mockStatusData,
      categories: updatedCategories,
      incidents: incidents.length > 0 ? incidents : mockStatusData.incidents,
      maintenance: maintenance.length > 0 ? maintenance : mockStatusData.maintenance,
      overall: getOverallStatus(updatedCategories),
      lastUpdated: new Date().toISOString()
    }

    return NextResponse.json(updatedStatusData)
  } catch (error) {
    console.error('Error fetching status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    )
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