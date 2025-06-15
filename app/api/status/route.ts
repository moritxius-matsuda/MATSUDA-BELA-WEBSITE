import { NextResponse } from 'next/server'
import { mockStatusData, getOverallStatus } from '@/lib/status-data'

// Simuliere echte Service-Checks
async function checkServiceHealth(url?: string): Promise<{ status: 'operational' | 'degraded' | 'major_outage', responseTime?: number }> {
  if (!url) {
    return { status: 'operational', responseTime: Math.floor(Math.random() * 200) + 50 }
  }

  try {
    const start = Date.now()
    const response = await fetch(url, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // 5 Sekunden Timeout
    })
    const responseTime = Date.now() - start

    if (response.ok) {
      if (responseTime > 2000) {
        return { status: 'degraded', responseTime }
      }
      return { status: 'operational', responseTime }
    } else {
      return { status: 'major_outage', responseTime }
    }
  } catch (error) {
    return { status: 'major_outage' }
  }
}

export async function GET() {
  try {
    // Simuliere Live-Service-Checks
    const updatedCategories = await Promise.all(
      mockStatusData.categories.map(async (category) => {
        const updatedServices = await Promise.all(
          category.services.map(async (service) => {
            const healthCheck = await checkServiceHealth(service.url)
            return {
              ...service,
              status: healthCheck.status,
              responseTime: healthCheck.responseTime,
              lastChecked: new Date().toISOString()
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