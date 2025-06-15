'use client'

import { useState, useEffect } from 'react'
import { mockStatusData, getStatusColor, getStatusBgColor, getStatusText } from '@/lib/status-data'
import { SystemStatus, StatusIncident, MaintenanceWindow } from '@/types/status'

export default function StatusPage() {
  const [statusData, setStatusData] = useState<SystemStatus>(mockStatusData)
  const [selectedTab, setSelectedTab] = useState<'current' | 'incidents' | 'maintenance'>('current')

  // Simuliere Live-Updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusData(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        categories: prev.categories.map(category => ({
          ...category,
          services: category.services.map(service => ({
            ...service,
            lastChecked: new Date().toISOString(),
            responseTime: Math.floor(Math.random() * 300) + 50 // 50-350ms
          }))
        }))
      }))
    }, 30000) // Update alle 30 Sekunden

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            System Status
          </h1>
          <p className="text-white/70 text-lg mb-6">
            Aktuelle Verfügbarkeit und Performance unserer Services
          </p>
          
          {/* Overall Status */}
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full border ${getStatusBgColor(statusData.overall)}`}>
            <div className={`w-3 h-3 rounded-full ${statusData.overall === 'operational' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className={`font-semibold ${getStatusColor(statusData.overall)}`}>
              {statusData.overall === 'operational' ? 'Alle Systeme betriebsbereit' : `System Status: ${getStatusText(statusData.overall)}`}
            </span>
          </div>
          
          <p className="text-white/50 text-sm mt-3">
            Letztes Update: {formatRelativeTime(statusData.lastUpdated)}
          </p>
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
          <div className="space-y-6">
            {statusData.categories.map((category) => (
              <div key={category.id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <p className="text-white/60 text-sm">{category.description}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {category.services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${service.status === 'operational' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div>
                          <h4 className="font-medium text-white">{service.name}</h4>
                          <p className="text-white/60 text-sm">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                        {service.responseTime && (
                          <p className="text-white/50 text-xs mt-1">
                            {service.responseTime}ms
                          </p>
                        )}
                        <p className="text-white/40 text-xs">
                          {formatRelativeTime(service.lastChecked)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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