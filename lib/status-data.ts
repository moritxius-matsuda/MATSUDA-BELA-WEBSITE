import { SystemStatus, ServiceStatus, StatusCategory, StatusIncident, MaintenanceWindow } from '@/types/status'

// Mock-Daten für die Status-Seite
export const mockStatusData: SystemStatus = {
  overall: 'operational' as ServiceStatus,
  lastUpdated: new Date().toISOString(),
  categories: [
    {
      id: 'website',
      name: 'Website & Frontend',
      description: 'Hauptwebsite und Benutzeroberfläche',
      services: [
        {
          id: 'main-website',
          name: 'Hauptwebsite',
          description: 'moritxius.de Hauptseite',
          status: 'operational',
          category: 'website',
          url: 'https://moritxius.de',
          lastChecked: new Date().toISOString(),
          responseTime: 245
        },
        {
          id: 'guides-system',
          name: 'Guides System',
          description: 'Anleitungen und Tutorials',
          status: 'operational',
          category: 'website',
          lastChecked: new Date().toISOString(),
          responseTime: 312
        }
      ]
    },
    {
      id: 'authentication',
      name: 'Authentifizierung',
      description: 'Benutzeranmeldung und -verwaltung',
      services: [
        {
          id: 'clerk-auth',
          name: 'Clerk Authentication',
          description: 'Benutzeranmeldung über Clerk',
          status: 'operational',
          category: 'authentication',
          url: 'https://api.clerk.dev',
          lastChecked: new Date().toISOString(),
          responseTime: 156
        }
      ]
    },
    {
      id: 'database',
      name: 'Datenbank & Storage',
      description: 'Datenspeicherung und -verwaltung',
      services: [
        {
          id: 'upstash-redis',
          name: 'Upstash Redis',
          description: 'Kommentare und Cache-Speicher',
          status: 'operational',
          category: 'database',
          url: 'https://epic-werewolf-17800.upstash.io',
          lastChecked: new Date().toISOString(),
          responseTime: 89
        }
      ]
    },
    {
      id: 'apis',
      name: 'APIs & Services',
      description: 'Backend-APIs und externe Services',
      services: [
        {
          id: 'comments-api',
          name: 'Kommentar API',
          description: 'API für Kommentare und Bewertungen',
          status: 'operational',
          category: 'apis',
          lastChecked: new Date().toISOString(),
          responseTime: 198
        },
        {
          id: 'guides-api',
          name: 'Guides API',
          description: 'API für Anleitungen und Inhalte',
          status: 'operational',
          category: 'apis',
          lastChecked: new Date().toISOString(),
          responseTime: 167
        }
      ]
    }
  ],
  incidents: [
    {
      id: 'incident-1',
      title: 'Langsame Ladezeiten bei Kommentaren',
      description: 'Benutzer melden langsame Ladezeiten beim Laden von Kommentaren.',
      status: 'resolved',
      impact: 'minor',
      affectedServices: ['comments-api', 'upstash-redis'],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 Tage her
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 Tag her
      updates: [
        {
          id: 'update-1',
          message: 'Wir untersuchen Berichte über langsame Ladezeiten bei Kommentaren.',
          status: 'investigating',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'update-2',
          message: 'Problem identifiziert: Redis-Cache-Konfiguration optimiert.',
          status: 'identified',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'update-3',
          message: 'Fix implementiert und wird überwacht.',
          status: 'monitoring',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'update-4',
          message: 'Problem vollständig behoben. Ladezeiten sind wieder normal.',
          status: 'resolved',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  ],
  maintenance: [
    {
      id: 'maintenance-1',
      title: 'Geplante Datenbankwartung',
      description: 'Routinewartung der Redis-Datenbank zur Leistungsoptimierung.',
      scheduledStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // In 7 Tagen
      scheduledEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2 Stunden später
      affectedServices: ['upstash-redis', 'comments-api'],
      status: 'scheduled'
    }
  ]
}

// Hilfsfunktionen
export const getOverallStatus = (categories: StatusCategory[]): ServiceStatus => {
  const allServices = categories.flatMap(cat => cat.services)
  
  if (allServices.some(service => service.status === 'major_outage')) {
    return 'major_outage'
  }
  if (allServices.some(service => service.status === 'partial_outage')) {
    return 'partial_outage'
  }
  if (allServices.some(service => service.status === 'degraded')) {
    return 'degraded'
  }
  if (allServices.some(service => service.status === 'maintenance')) {
    return 'maintenance'
  }
  
  return 'operational'
}

export const getStatusColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational':
      return 'text-green-400'
    case 'degraded':
      return 'text-yellow-400'
    case 'partial_outage':
      return 'text-orange-400'
    case 'major_outage':
      return 'text-red-400'
    case 'maintenance':
      return 'text-blue-400'
    default:
      return 'text-gray-400'
  }
}

export const getStatusBgColor = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational':
      return 'bg-green-500/20 border-green-500/30'
    case 'degraded':
      return 'bg-yellow-500/20 border-yellow-500/30'
    case 'partial_outage':
      return 'bg-orange-500/20 border-orange-500/30'
    case 'major_outage':
      return 'bg-red-500/20 border-red-500/30'
    case 'maintenance':
      return 'bg-blue-500/20 border-blue-500/30'
    default:
      return 'bg-gray-500/20 border-gray-500/30'
  }
}

export const getStatusText = (status: ServiceStatus): string => {
  switch (status) {
    case 'operational':
      return 'Betriebsbereit'
    case 'degraded':
      return 'Beeinträchtigt'
    case 'partial_outage':
      return 'Teilausfall'
    case 'major_outage':
      return 'Großer Ausfall'
    case 'maintenance':
      return 'Wartung'
    default:
      return 'Unbekannt'
  }
}