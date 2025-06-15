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
        } else {
          setCurrentIncident(null)
        }
      } catch (error) {
        console.error('StatusIndicator: Failed to fetch incidents:', error)
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
    <div className="relative group">
      <Link 
        href="/status"
        className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300"
      >
        <div className={`w-2 h-2 rounded-full ${
          finalStatus === 'operational' ? 'bg-green-400' : 
          finalStatus === 'degraded' ? 'bg-yellow-400' :
          finalStatus === 'partial_outage' ? 'bg-orange-400' :
          finalStatus === 'major_outage' ? 'bg-red-400' :
          'bg-blue-400'
        } ${finalStatus === 'operational' ? 'animate-pulse' : 'animate-ping'}`}></div>
        
        <span className={`text-xs font-medium transition-colors duration-300 ${
          finalStatus === 'operational' ? 'text-green-400' : getStatusColor(finalStatus)
        } group-hover:text-white`}>
          {finalStatus === 'operational' ? 'Betriebsbereit' : getStatusText(finalStatus)}
        </span>
        
        {/* Kleiner Pfeil-Indikator */}
        <svg className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Hover Tooltip mit aktuellem Vorfall */}
      <div className="absolute top-full left-0 mt-2 w-80 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
        {/* System Status */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${
            finalStatus === 'operational' ? 'bg-green-400' : 
            finalStatus === 'degraded' ? 'bg-yellow-400' :
            finalStatus === 'partial_outage' ? 'bg-orange-400' :
            finalStatus === 'major_outage' ? 'bg-red-400' :
            'bg-blue-400'
          }`}></div>
          <span className="text-white font-medium text-sm">
            {finalStatus === 'operational' ? 'Alle Systeme betriebsbereit' : `System Status: ${getStatusText(finalStatus)}`}
          </span>
        </div>

        {/* Aktueller Vorfall (falls vorhanden) */}
        {currentIncident && (
          <div className="border-t border-white/10 pt-3">
            <div className="flex items-start gap-2">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                currentIncident.impact === 'critical' || currentIncident.impact === 'major_outage' ? 'bg-red-400' :
                currentIncident.impact === 'major' || currentIncident.impact === 'partial_outage' ? 'bg-orange-400' :
                currentIncident.impact === 'minor' || currentIncident.impact === 'degraded' ? 'bg-yellow-400' :
                'bg-blue-400'
              } animate-ping`}></div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm mb-1">Aktueller Vorfall:</h4>
                <p className="text-white/90 text-xs font-medium mb-1">{currentIncident.title}</p>
                <p className="text-white/70 text-xs leading-relaxed mb-2" style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {currentIncident.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentIncident.status === 'investigating' ? 'bg-red-500/20 text-red-300' :
                    currentIncident.status === 'identified' ? 'bg-orange-500/20 text-orange-300' :
                    currentIncident.status === 'monitoring' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {currentIncident.status === 'investigating' ? 'Wird untersucht' :
                     currentIncident.status === 'identified' ? 'Identifiziert' :
                     currentIncident.status === 'monitoring' ? 'Wird überwacht' : 'Behoben'}
                  </span>
                  <span className="text-white/50 text-xs">
                    {new Date(currentIncident.createdAt).toLocaleString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-white/10 pt-3 mt-3">
          <p className="text-white/50 text-xs text-center">
            Klicken für vollständige Status-Seite
          </p>
        </div>
      </div>
    </div>
  )
}