'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ServiceStatus, StatusIncident } from '@/types/status'
import { getStatusColor, getStatusText } from '@/lib/status-data'

export default function StatusIndicator() {
  const [status, setStatus] = useState<ServiceStatus>('operational')
  const [loading, setLoading] = useState(true)
  const [currentIncident, setCurrentIncident] = useState<StatusIncident | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/status')
        if (response.ok) {
          const data = await response.json()
          setStatus(data.overall)
        }
      } catch (error) {
        console.error('Failed to fetch status:', error)
        setStatus('major_outage')
      }
    }

    const fetchCurrentIncidents = async () => {
      try {
        const response = await fetch('/api/incidents?status=active&limit=1')
        if (response.ok) {
          const data = await response.json()
          const incidents = data.incidents || []
          if (incidents.length > 0) {
            setCurrentIncident(incidents[0]) // Nehme den ersten/wichtigsten Vorfall
          } else {
            setCurrentIncident(null)
          }
        }
      } catch (error) {
        console.error('Failed to fetch incidents:', error)
        setCurrentIncident(null)
      }
    }

    const fetchAll = async () => {
      await Promise.all([fetchStatus(), fetchCurrentIncidents()])
      setLoading(false)
    }

    // Initial fetch
    fetchAll()

    // Update alle 60 Sekunden
    const interval = setInterval(fetchAll, 60000)

    return () => clearInterval(interval)
  }, [])

  // Bestimme den finalen Status basierend auf Vorfällen
  const getFinalStatus = (): ServiceStatus => {
    if (!currentIncident) return status

    // Map incident impact to service status
    switch (currentIncident.impact) {
      case 'critical':
      case 'major_outage':
        return 'major_outage'
      case 'major':
      case 'partial_outage':
        return 'partial_outage'
      case 'minor':
      case 'degraded':
        return 'degraded'
      default:
        return status
    }
  }

  const finalStatus = getFinalStatus()
  const displayText = currentIncident ? currentIncident.title : (finalStatus === 'operational' ? 'Betriebsbereit' : getStatusText(finalStatus))

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs text-white/70">Status...</span>
      </div>
    )
  }

  return (
    <Link 
      href="/status"
      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group max-w-xs"
      title={currentIncident ? `Aktueller Vorfall: ${currentIncident.title}` : "System Status anzeigen"}
    >
      <div className={`w-2 h-2 rounded-full ${
        finalStatus === 'operational' ? 'bg-green-400' : 
        finalStatus === 'degraded' ? 'bg-yellow-400' :
        finalStatus === 'partial_outage' ? 'bg-orange-400' :
        finalStatus === 'major_outage' ? 'bg-red-400' :
        'bg-blue-400'
      } ${finalStatus === 'operational' ? 'animate-pulse' : 'animate-ping'}`}></div>
      
      <span className={`text-xs font-medium transition-colors duration-300 truncate ${
        finalStatus === 'operational' ? 'text-green-400' : getStatusColor(finalStatus)
      } group-hover:text-white`}>
        {displayText}
      </span>
      
      {/* Kleiner Pfeil-Indikator */}
      <svg className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}