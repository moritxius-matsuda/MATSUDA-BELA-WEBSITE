'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ServiceStatus } from '@/types/status'
import { getStatusColor, getStatusText } from '@/lib/status-data'

export default function StatusIndicator() {
  const [status, setStatus] = useState<ServiceStatus>('operational')
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchStatus()

    // Update alle 60 Sekunden
    const interval = setInterval(fetchStatus, 60000)

    return () => clearInterval(interval)
  }, [])

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
      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 group"
      title="System Status anzeigen"
    >
      <div className={`w-2 h-2 rounded-full ${
        status === 'operational' ? 'bg-green-400' : 
        status === 'degraded' ? 'bg-yellow-400' :
        status === 'partial_outage' ? 'bg-orange-400' :
        status === 'major_outage' ? 'bg-red-400' :
        'bg-blue-400'
      } ${status === 'operational' ? 'animate-pulse' : 'animate-ping'}`}></div>
      
      <span className={`text-xs font-medium transition-colors duration-300 ${
        status === 'operational' ? 'text-green-400' : getStatusColor(status)
      } group-hover:text-white`}>
        {status === 'operational' ? 'Betriebsbereit' : getStatusText(status)}
      </span>
      
      {/* Kleiner Pfeil-Indikator */}
      <svg className="w-3 h-3 text-white/50 group-hover:text-white/80 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}