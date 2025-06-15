'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { mockStatusData, getStatusColor, getStatusBgColor, getStatusText } from '@/lib/status-data'
import { SystemStatus, StatusIncident, MaintenanceWindow, ServiceStatus } from '@/types/status'
import StatusTimeline from '@/components/status/StatusTimeline'

export default function StatusPage() {
  const { user } = useUser()
  const [statusData, setStatusData] = useState<SystemStatus>(mockStatusData)
  const [selectedTab, setSelectedTab] = useState<'current' | 'incidents' | 'maintenance'>('current')
  const [stats, setStats] = useState({
    uptime: 0,
    avgResponseTime: 0,
    incidents: 0,
    maintenance: 0,
    loading: true
  })
  const [currentIncidents, setCurrentIncidents] = useState<StatusIncident[]>([])
  const [loadingIncidents, setLoadingIncidents] = useState(true)
  
  // Prüfe Admin-Berechtigung (nur für angemeldete Benutzer)
  const isAdmin = user?.publicMetadata?.admin === 1

  // Bestimme Gesamtstatus basierend auf aktuellen Vorfällen
  const getOverallStatusFromIncidents = (): ServiceStatus => {
    if (currentIncidents.length === 0) {
      return statusData.overall // Verwende API-Status wenn keine Vorfälle
    }

    // Finde den schwerwiegendsten Vorfall
    const severityOrder: ServiceStatus[] = ['major_outage', 'partial_outage', 'degraded', 'maintenance', 'operational']
    let mostSevere: ServiceStatus = 'operational'

    currentIncidents.forEach(incident => {
      if (incident.status === 'investigating' || incident.status === 'identified' || incident.status === 'monitoring') {
        // Map incident impact to service status
        let mappedImpact: ServiceStatus = 'operational'
        switch (incident.impact) {
          case 'critical':
          case 'major_outage':
            mappedImpact = 'major_outage'
            break
          case 'major':
          case 'partial_outage':
            mappedImpact = 'partial_outage'
            break
          case 'minor':
          case 'degraded':
            mappedImpact = 'degraded'
            break
          default:
            mappedImpact = 'operational'
        }
        
        const impactIndex = severityOrder.indexOf(mappedImpact)
        const currentIndex = severityOrder.indexOf(mostSevere)
        if (impactIndex !== -1 && impactIndex < currentIndex) {
          mostSevere = mappedImpact
        }
      }
    })

    return mostSevere
  }

  const overallStatus: ServiceStatus = getOverallStatusFromIncidents()

  // Bestimme Service-Status basierend auf betroffenen Services in Incidents
  const getServiceStatusFromIncidents = (serviceName: string): ServiceStatus => {
    const affectedIncidents = currentIncidents.filter(incident => 
      (incident.status === 'investigating' || incident.status === 'identified' || incident.status === 'monitoring') &&
      incident.affectedServices.includes(serviceName)
    )

    if (affectedIncidents.length === 0) {
      return 'operational'
    }

    // Finde den schwerwiegendsten Vorfall für diesen Service
    const severityOrder: ServiceStatus[] = ['major_outage', 'partial_outage', 'degraded', 'maintenance', 'operational']
    let mostSevere: ServiceStatus = 'operational'

    affectedIncidents.forEach(incident => {
      let mappedImpact: ServiceStatus = 'operational'
      switch (incident.impact) {
        case 'critical':
        case 'major_outage':
          mappedImpact = 'major_outage'
          break
        case 'major':
        case 'partial_outage':
          mappedImpact = 'partial_outage'
          break
        case 'minor':
        case 'degraded':
          mappedImpact = 'degraded'
          break
      }

      if (severityOrder.indexOf(mappedImpact) < severityOrder.indexOf(mostSevere)) {
        mostSevere = mappedImpact
      }
    })

    return mostSevere
  }

  // Berechne Uptime basierend auf Service-Status
  const calculateServiceUptime = (serviceName: string, baseUptime: number): number => {
    const serviceStatus = getServiceStatusFromIncidents(serviceName)
    
    switch (serviceStatus) {
      case 'major_outage':
        return Math.max(baseUptime - 5, 85) // Reduziere um 5%, mindestens 85%
      case 'partial_outage':
        return Math.max(baseUptime - 2, 90) // Reduziere um 2%, mindestens 90%
      case 'degraded':
        return Math.max(baseUptime - 1, 95) // Reduziere um 1%, mindestens 95%
      case 'maintenance':
        return Math.max(baseUptime - 0.5, 98) // Reduziere um 0.5%, mindestens 98%
      default:
        return baseUptime
    }
  }

  // Lade echte Daten von der API
  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        const response = await fetch('/api/status')
        if (response.ok) {
          const data = await response.json()
          setStatusData(data)
        }
      } catch (error) {
        console.error('Error fetching status data:', error)
      }
    }

    const fetchStats = async () => {
      try {
        // Lade Statistiken für alle Services
        const response = await fetch('/api/status/stats')
        if (response.ok) {
          const data = await response.json()
          setStats({
            uptime: data.uptime || 0,
            avgResponseTime: data.avgResponseTime || 0,
            incidents: data.incidents || 0,
            maintenance: data.maintenance || 0,
            loading: false
          })
        } else {
          // Fallback wenn keine Stats verfügbar
          setStats(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    const fetchCurrentIncidents = async () => {
      try {
        // Lade aktuelle Vorfälle
        const response = await fetch('/api/incidents?status=active')
        if (response.ok) {
          const data = await response.json()
          setCurrentIncidents(data.incidents || [])
        } else {
          setCurrentIncidents([])
        }
        setLoadingIncidents(false)
      } catch (error) {
        console.error('Error fetching current incidents:', error)
        setCurrentIncidents([])
        setLoadingIncidents(false)
      }
    }

    // Initial fetch
    fetchStatusData()
    fetchStats()
    fetchCurrentIncidents()

    // Update alle 30 Sekunden
    const interval = setInterval(() => {
      fetchStatusData()
      fetchStats()
      fetchCurrentIncidents()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Gerade eben'
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Min`
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Std`
    return `vor ${Math.floor(diffInMinutes / 1440)} Tag(en)`
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-start mb-4">
            <div className="w-24"></div> {/* Spacer für Balance */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                System Status
              </h1>
              <p className="text-white/70 text-lg">
                Aktuelle Verfügbarkeit und Performance unserer Services
              </p>
            </div>
            <div className="w-24 flex justify-end">
              {isAdmin && (
                <Link
                  href="/status/admin"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300 text-sm"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
          
          {/* Quick Stats - ECHTE DATEN */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {stats.loading ? '...' : `${stats.uptime.toFixed(1)}%`}
              </div>
              <div className="text-white/60 text-sm">Verfügbarkeit (90 Tage)</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {stats.loading ? '...' : `${Math.round(stats.avgResponseTime)}ms`}
              </div>
              <div className="text-white/60 text-sm">Ø Antwortzeit</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {stats.loading ? '...' : stats.incidents}
              </div>
              <div className="text-white/60 text-sm">Vorfälle (30 Tage)</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {stats.loading ? '...' : stats.maintenance}
              </div>
              <div className="text-white/60 text-sm">Geplante Wartungen</div>
            </div>
          </div>
          
          {/* Overall Status - MIT AKTUELLEN VORFÄLLEN */}
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${getStatusBgColor(overallStatus)}`}>
              <div className={`w-3 h-3 rounded-full ${
                getStatusColor(overallStatus).includes('green') ? 'bg-green-400' : 
                getStatusColor(overallStatus).includes('yellow') ? 'bg-yellow-400' : 
                getStatusColor(overallStatus).includes('orange') ? 'bg-orange-400' : 'bg-red-400'
              } animate-pulse`}></div>
              <span className={`font-semibold ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'operational' ? 'Alle Systeme betriebsbereit' : `System Status: ${getStatusText(overallStatus)}`}
              </span>
            </div>

            {/* Aktuelle Vorfälle anzeigen */}
            {!loadingIncidents && Array.isArray(currentIncidents) && currentIncidents.length > 0 && (
              <div className="space-y-3 max-w-2xl mx-auto">
                <h3 className="text-white/80 font-medium text-sm">Aktuelle Vorfälle:</h3>
                {currentIncidents.slice(0, 2).map((incident) => {
                  // Map incident impact to service status for styling
                  const getIncidentStatusForStyling = (impact: string): ServiceStatus => {
                    switch (impact) {
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
                        return 'operational'
                    }
                  }
                  
                  const getBorderColor = (impact: string): string => {
                    switch (impact) {
                      case 'critical':
                      case 'major_outage':
                        return 'border-red-500'
                      case 'major':
                      case 'partial_outage':
                        return 'border-orange-500'
                      case 'minor':
                      case 'degraded':
                        return 'border-yellow-500'
                      default:
                        return 'border-blue-500'
                    }
                  }
                  
                  return (
                    <div key={incident.id} className={`p-4 rounded-lg border-l-4 ${getStatusBgColor(getIncidentStatusForStyling(incident.impact))} ${getBorderColor(incident.impact)}`}>
                      <div className="flex items-start justify-between">
                        <div className="text-left flex-1">
                          <h4 className="font-medium text-white text-sm">{incident.title}</h4>
                          <p className="text-white/70 text-xs mt-1 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>{incident.description}</p>
                          <p className="text-white/50 text-xs mt-2">
                            {new Date(incident.createdAt).toLocaleString('de-DE')}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                            incident.status === 'investigating' ? 'bg-red-500/20 text-red-300' :
                            incident.status === 'identified' ? 'bg-orange-500/20 text-orange-300' :
                            incident.status === 'monitoring' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {incident.status === 'investigating' ? 'Wird untersucht' :
                             incident.status === 'identified' ? 'Identifiziert' :
                             incident.status === 'monitoring' ? 'Wird überwacht' : 'Behoben'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {Array.isArray(currentIncidents) && currentIncidents.length > 2 && (
                  <p className="text-white/50 text-xs text-center">
                    +{currentIncidents.length - 2} weitere Vorfälle - Siehe "Vorfälle" Tab
                  </p>
                )}
              </div>
            )}
            
            <p className="text-white/50 text-sm">
              Letztes Update: {formatRelativeTime(statusData.lastUpdated)}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-1 rounded-lg">
            <div className="flex gap-1">
              {[
                { key: 'current', label: 'Aktueller Status' },
                { key: 'incidents', label: 'Vorfälle' },
                { key: 'maintenance', label: 'Wartungen' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    selectedTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedTab === 'current' && (
          <div className="space-y-8">
            {/* Service Status Cards */}
            <div className="space-y-6">
              {statusData.categories.map((category) => (
                <div key={category.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                      <p className="text-white/60 text-sm">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {category.services.map((service) => {
                      // Bestimme aktuellen Status basierend auf Incidents
                      const incidentStatus = getServiceStatusFromIncidents(service.name)
                      const finalStatus = incidentStatus !== 'operational' ? incidentStatus : service.status
                      const baseUptime = service.uptime || 99.9
                      const adjustedUptime = calculateServiceUptime(service.name, baseUptime)
                      
                      // Finde betroffene Incidents für diesen Service
                      const affectedIncidents = currentIncidents.filter(incident => 
                        (incident.status === 'investigating' || incident.status === 'identified' || incident.status === 'monitoring') &&
                        incident.affectedServices.includes(service.name)
                      )
                      
                      return (
                        <div key={service.id} className="space-y-3">
                          {/* Service Header */}
                          <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${getStatusBgColor(finalStatus).replace('bg-', 'bg-').split(' ')[0]}`}></div>
                              <div>
                                <h4 className="font-medium text-white">{service.name}</h4>
                                <p className="text-white/60 text-sm">{service.description}</p>
                                {affectedIncidents.length > 0 && (
                                  <p className="text-orange-400 text-xs mt-1">
                                    Betroffen von {affectedIncidents.length} Vorfall{affectedIncidents.length > 1 ? 'en' : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <span className={`text-sm font-medium ${getStatusColor(finalStatus)}`}>
                                {getStatusText(finalStatus)}
                              </span>
                              <p className="text-white/50 text-xs mt-1">
                                {adjustedUptime.toFixed(1)}% Uptime
                              </p>
                              {service.responseTime && (
                                <p className="text-white/50 text-xs">
                                  {service.responseTime}ms
                                </p>
                              )}
                              <p className="text-white/40 text-xs">
                                {formatRelativeTime(service.lastChecked)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Incident Details für diesen Service */}
                          {affectedIncidents.length > 0 && (
                            <div className="ml-4 space-y-2">
                              {affectedIncidents.slice(0, 2).map((incident) => (
                                <div key={incident.id} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                  <div className={`w-2 h-2 rounded-full ${
                                    incident.status === 'investigating' ? 'bg-red-400' :
                                    incident.status === 'identified' ? 'bg-orange-400' :
                                    'bg-yellow-400'
                                  }`}></div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{incident.title}</p>
                                    <p className="text-white/60 text-xs">{incident.description}</p>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    incident.status === 'investigating' ? 'bg-red-500/20 text-red-300' :
                                    incident.status === 'identified' ? 'bg-orange-500/20 text-orange-300' :
                                    'bg-yellow-500/20 text-yellow-300'
                                  }`}>
                                    {incident.status === 'investigating' ? 'Wird untersucht' :
                                     incident.status === 'identified' ? 'Identifiziert' : 'Wird überwacht'}
                                  </span>
                                </div>
                              ))}
                              {affectedIncidents.length > 2 && (
                                <p className="text-white/50 text-xs ml-5">
                                  +{affectedIncidents.length - 2} weitere Vorfälle
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Status Timeline - Last 90 Days */}
                          <StatusTimeline serviceId={service.id} currentStatus={finalStatus} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'incidents' && (
          <div className="space-y-6">
            {statusData.incidents.length > 0 ? (
              statusData.incidents.map((incident) => (
                <div key={incident.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{incident.title}</h3>
                      <p className="text-white/70 mb-3">{incident.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          incident.status === 'monitoring' ? 'bg-blue-500/20 text-blue-400' :
                          incident.status === 'identified' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {incident.status === 'resolved' ? 'Behoben' :
                           incident.status === 'monitoring' ? 'Überwacht' :
                           incident.status === 'identified' ? 'Identifiziert' :
                           'Untersucht'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          incident.impact === 'critical' ? 'bg-red-500/20 text-red-400' :
                          incident.impact === 'major' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {incident.impact === 'critical' ? 'Kritisch' :
                           incident.impact === 'major' ? 'Schwerwiegend' :
                           'Gering'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-white/50 text-sm">
                      <p>{formatDate(incident.createdAt)}</p>
                    </div>
                  </div>
                  
                  {/* Updates */}
                  <div className="space-y-3 mt-6">
                    <h4 className="font-medium text-white/80">Updates:</h4>
                    {incident.updates.map((update) => (
                      <div key={update.id} className="flex gap-4 p-3 bg-white/5 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          update.status === 'resolved' ? 'bg-green-400' :
                          update.status === 'monitoring' ? 'bg-blue-400' :
                          update.status === 'identified' ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-white/80">{update.message}</p>
                          <p className="text-white/50 text-xs mt-1">{formatDate(update.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Keine aktuellen Vorfälle</h3>
                <p className="text-white/60">Alle Systeme laufen normal.</p>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'maintenance' && (
          <div className="space-y-6">
            {statusData.maintenance.length > 0 ? (
              statusData.maintenance.map((maintenance) => (
                <div key={maintenance.id} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">{maintenance.title}</h3>
                      <p className="text-white/70 mb-3">{maintenance.description}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        maintenance.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        maintenance.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {maintenance.status === 'completed' ? 'Abgeschlossen' :
                         maintenance.status === 'in_progress' ? 'Läuft' :
                         'Geplant'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-white/60 text-sm">Geplanter Start:</p>
                      <p className="text-white font-medium">{formatDate(maintenance.scheduledStart)}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Geplantes Ende:</p>
                      <p className="text-white font-medium">{formatDate(maintenance.scheduledEnd)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-8 text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Keine geplanten Wartungen</h3>
                <p className="text-white/60">Aktuell sind keine Wartungsarbeiten geplant.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}