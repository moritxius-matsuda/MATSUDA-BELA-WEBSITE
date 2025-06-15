export type ServiceStatus = 'operational' | 'degraded' | 'partial_outage' | 'major_outage' | 'maintenance'

export interface Service {
  id: string
  name: string
  description: string
  status: ServiceStatus
  category: string
  url?: string
  lastChecked: string
  responseTime?: number
  uptime?: number
}

export interface StatusCategory {
  id: string
  name: string
  description: string
  services: Service[]
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved'

export interface StatusIncident {
  id: string
  title: string
  description: string
  status: IncidentStatus
  impact: 'minor' | 'major' | 'critical' | 'degraded' | 'partial_outage' | 'major_outage'
  affectedServices: string[]
  createdAt: string
  updatedAt: string
  updates: StatusUpdate[]
}

export interface StatusUpdate {
  id: string
  message: string
  status: IncidentStatus
  timestamp: string
}

export interface MaintenanceWindow {
  id: string
  title: string
  description: string
  scheduledStart: string
  scheduledEnd: string
  affectedServices: string[]
  status: 'scheduled' | 'in_progress' | 'completed'
}

export interface SystemStatus {
  overall: ServiceStatus
  categories: StatusCategory[]
  incidents: StatusIncident[]
  maintenance: MaintenanceWindow[]
  lastUpdated: string
}