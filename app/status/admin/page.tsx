'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { StatusIncident, IncidentStatus } from '@/types/status'
import { mockStatusData } from '@/lib/status-data'

export default function StatusAdminPage() {
  const { user } = useUser()
  const [incidents, setIncidents] = useState<StatusIncident[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    impact: 'minor' as 'minor' | 'major' | 'critical',
    affectedServices: [] as string[]
  })

  // Prüfe Admin-Berechtigung
  const isAdmin = user?.publicMetadata?.admin === 1

  useEffect(() => {
    if (!isAdmin) return
    fetchIncidents()
  }, [isAdmin])

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents')
      if (response.ok) {
        const data = await response.json()
        console.log('Admin: Received incidents data:', data)
        // Handle both old format (direct array) and new format (object with incidents array)
        const incidentsArray = Array.isArray(data) ? data : (data.incidents || [])
        setIncidents(incidentsArray)
      }
    } catch (error) {
      console.error('Error fetching incidents:', error)
      setIncidents([]) // Ensure incidents is always an array
    } finally {
      setLoading(false)
    }
  }

  const createIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const newIncident = await response.json()
        setIncidents([newIncident, ...incidents])
        setFormData({
          title: '',
          description: '',
          impact: 'minor',
          affectedServices: []
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating incident:', error)
    }
  }

  const updateIncident = async (id: string, message: string, status: IncidentStatus) => {
    try {
      console.log(`Admin: Updating incident ${id} to status ${status} with message: ${message}`)
      
      const response = await fetch('/api/incidents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, message, status })
      })

      console.log(`Admin: Update response status: ${response.status}`)

      if (response.ok) {
        const updatedIncident = await response.json()
        console.log('Admin: Updated incident:', updatedIncident)
        setIncidents(incidents.map(inc => inc.id === id ? updatedIncident : inc))
        console.log('Admin: Incidents state updated')
      } else {
        const errorText = await response.text()
        console.error('Admin: Update failed:', errorText)
        alert(`Fehler beim Aktualisieren: ${errorText}`)
      }
    } catch (error) {
      console.error('Admin: Error updating incident:', error)
      alert(`Fehler beim Aktualisieren: ${error.message}`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Anmeldung erforderlich</h1>
          <p className="text-white/60">Bitte melden Sie sich an, um auf das Admin-Panel zuzugreifen.</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Zugriff verweigert</h1>
          <p className="text-white/60">Sie haben keine Berechtigung für das Status-Admin-Panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Status Admin Panel</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
          >
            Neuer Vorfall
          </button>
        </div>

        {/* Create Incident Form */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-card p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-white mb-4">Neuen Vorfall erstellen</h2>
              
              <form onSubmit={createIncident} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Titel
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Beschreibung
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-400/50 resize-none"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Auswirkung
                  </label>
                  <select
                    value={formData.impact}
                    onChange={(e) => setFormData({ ...formData, impact: e.target.value as any })}
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400/50"
                  >
                    <option value="minor">Gering</option>
                    <option value="major">Schwerwiegend</option>
                    <option value="critical">Kritisch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Betroffene Services
                  </label>
                  <div className="space-y-2">
                    {mockStatusData.categories.flatMap(cat => cat.services).map(service => (
                      <label key={service.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.affectedServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                affectedServices: [...formData.affectedServices, service.id]
                              })
                            } else {
                              setFormData({
                                ...formData,
                                affectedServices: formData.affectedServices.filter(id => id !== service.id)
                              })
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-white/80 text-sm">{service.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Vorfall erstellen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors duration-300"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Incidents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
              <p className="text-white/60 mt-2">Lade Vorfälle...</p>
            </div>
          ) : !Array.isArray(incidents) || incidents.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Keine Vorfälle</h3>
              <p className="text-white/60">Aktuell sind keine Vorfälle registriert.</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
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

                {/* Quick Actions */}
                {incident.status !== 'resolved' && (
                  <div className="flex gap-2 mb-4">
                    {incident.status === 'investigating' && (
                      <button
                        onClick={() => updateIncident(incident.id, 'Problem identifiziert und wird bearbeitet.', 'identified')}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors duration-300"
                      >
                        Als identifiziert markieren
                      </button>
                    )}
                    {(incident.status === 'investigating' || incident.status === 'identified') && (
                      <button
                        onClick={() => updateIncident(incident.id, 'Fix implementiert und wird überwacht.', 'monitoring')}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors duration-300"
                      >
                        Überwachung starten
                      </button>
                    )}
                    <button
                      onClick={() => updateIncident(incident.id, 'Problem vollständig behoben.', 'resolved')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors duration-300"
                    >
                      Als behoben markieren
                    </button>
                  </div>
                )}

                {/* Updates */}
                <div className="space-y-2">
                  <h4 className="font-medium text-white/80 text-sm">Updates:</h4>
                  {incident.updates.map((update) => (
                    <div key={update.id} className="flex gap-3 p-3 bg-white/5 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        update.status === 'resolved' ? 'bg-green-400' :
                        update.status === 'monitoring' ? 'bg-blue-400' :
                        update.status === 'identified' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm">{update.message}</p>
                        <p className="text-white/50 text-xs mt-1">{formatDate(update.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}