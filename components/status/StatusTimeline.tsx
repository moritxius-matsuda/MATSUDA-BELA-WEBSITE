'use client'

import { useState, useEffect } from 'react'

interface StatusTimelineProps {
  serviceId: string
  currentStatus?: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
}

interface DayStatus {
  date: string
  status: 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'
  uptime: number
  incidents: number
}

export default function StatusTimeline({ serviceId, currentStatus }: StatusTimelineProps) {
  const [timelineData, setTimelineData] = useState<DayStatus[]>([])
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null)

  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        console.log(`Fetching timeline data for service: ${serviceId}`)
        const response = await fetch(`/api/status/history?service=${serviceId}&days=90`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`Received timeline data:`, data.length, 'days')
          setTimelineData(data)
        } else {
          console.error('API response not ok:', response.status, response.statusText)
          setTimelineData([]) // Empty array if no data available
        }
      } catch (error) {
        console.error('Error fetching timeline data:', error)
        setTimelineData([]) // Empty array on error
      }
    }

    fetchTimelineData()
  }, [serviceId])

  // No mock data - only real data from API

  const getStatusColor = (status: DayStatus['status']) => {
    switch (status) {
      case 'operational': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'partial_outage': return 'bg-orange-500'
      case 'major_outage': return 'bg-red-500'
      case 'maintenance': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: DayStatus['status']) => {
    switch (status) {
      case 'operational': return 'Betriebsbereit'
      case 'degraded': return 'Beeinträchtigt'
      case 'partial_outage': return 'Teilausfall'
      case 'major_outage': return 'Ausfall'
      case 'maintenance': return 'Wartung'
      default: return 'Unbekannt'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getMonthLabel = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE', {
      month: 'short'
    })
  }

  // Group days by month for labels
  const groupedData = timelineData.reduce((acc, day, index) => {
    const month = getMonthLabel(day.date)
    if (!acc[month]) {
      acc[month] = []
    }
    acc[month].push({ ...day, index })
    return acc
  }, {} as Record<string, (DayStatus & { index: number })[]>)

  const calculateOverallUptime = () => {
    if (timelineData.length === 0) return 100
    const totalUptime = timelineData.reduce((sum, day) => sum + day.uptime, 0)
    let baseUptime = Math.round((totalUptime / timelineData.length) * 100) / 100
    
    // Adjust uptime based on current status from incidents
    if (currentStatus && currentStatus !== 'operational') {
      switch (currentStatus) {
        case 'major_outage':
          baseUptime = Math.max(baseUptime - 5, 85)
          break
        case 'partial_outage':
          baseUptime = Math.max(baseUptime - 2, 90)
          break
        case 'degraded':
          baseUptime = Math.max(baseUptime - 1, 95)
          break
        case 'maintenance':
          baseUptime = Math.max(baseUptime - 0.5, 98)
          break
      }
    }
    
    return Math.round(baseUptime * 100) / 100
  }

  // Show message if no data available
  if (timelineData.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-medium text-white/80">90 Tage Verlauf</h5>
          <div className="text-xs text-white/60">Sammle Daten...</div>
        </div>
        <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-center">
          <div className="text-white/60 text-sm">
            📊 Historische Daten werden gesammelt. Timeline wird verfügbar, sobald genügend Daten vorhanden sind.
          </div>
          <div className="text-white/40 text-xs mt-2">
            Monitoring läuft seit: {new Date().toLocaleDateString('de-DE')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h5 className="text-sm font-medium text-white/80">90 Tage Verlauf</h5>
          <div className="text-xs text-white/60">
            {calculateOverallUptime()}% Verfügbarkeit
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Betriebsbereit</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span>Beeinträchtigt</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Ausfall</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {/* Month Labels */}
        <div className="flex justify-between text-xs text-white/50 px-1">
          {Object.keys(groupedData).map((month, index) => (
            <div key={month} className="text-center">
              {month}
            </div>
          ))}
        </div>

        {/* Status Bars */}
        <div className="flex gap-1">
          {timelineData.map((day, index) => {
            // Check if this is today and we have a current status from incidents
            const today = new Date().toISOString().split('T')[0]
            const isToday = day.date === today
            const displayStatus = isToday && currentStatus ? currentStatus : day.status
            
            return (
              <div
                key={day.date}
                className={`h-8 flex-1 rounded-sm cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative ${getStatusColor(displayStatus)} ${isToday ? 'ring-2 ring-white/50' : ''}`}
                onMouseEnter={() => setSelectedDay({...day, status: displayStatus})}
                onMouseLeave={() => setSelectedDay(null)}
                title={`${formatDate(day.date)}: ${getStatusText(displayStatus)} (${day.uptime}%)${isToday ? ' (Heute)' : ''}`}
              >
              {/* Tooltip */}
              {selectedDay?.date === day.date && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-20">
                  <div className="bg-black/90 text-white text-xs rounded-lg p-3 shadow-lg border border-white/20 min-w-48">
                    <div className="font-medium mb-1">{formatDate(day.date)}</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium">{getStatusText(selectedDay.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verfügbarkeit:</span>
                        <span className="font-medium">{day.uptime}%</span>
                      </div>
                      {day.incidents > 0 && (
                        <div className="flex justify-between">
                          <span>Vorfälle:</span>
                          <span className="font-medium">{day.incidents}</span>
                        </div>
                      )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                      <div className="border-4 border-transparent border-t-black/90"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>

        {/* Day Labels (every 10 days) */}
        <div className="flex justify-between text-xs text-white/40 px-1">
          {timelineData.map((day, index) => (
            index % 10 === 0 ? (
              <div key={day.date} className="text-center">
                {new Date(day.date).getDate()}
              </div>
            ) : null
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-2">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-400">
            {timelineData.filter(d => d.status === 'operational').length}
          </div>
          <div className="text-xs text-white/60">Tage betriebsbereit</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-yellow-400">
            {timelineData.filter(d => d.status === 'degraded').length}
          </div>
          <div className="text-xs text-white/60">Tage beeinträchtigt</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-400">
            {timelineData.filter(d => ['partial_outage', 'major_outage'].includes(d.status)).length}
          </div>
          <div className="text-xs text-white/60">Tage mit Ausfällen</div>
        </div>
      </div>
    </div>
  )
}