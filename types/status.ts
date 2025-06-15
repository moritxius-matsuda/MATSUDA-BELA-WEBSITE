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
}

export interface StatusCategory {
  id: string
  name: string
  description: string
  services: Service[]
}

export interface StatusIncident {
  id: string
  title: string
  description: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  impact: 'minor' | 'major' | 'critical'
  affectedServices: string[]
  createdAt: string
  updatedAt: string
  updates: StatusUpdate[]
}

export interface StatusUpdate {
  id: string
  message: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
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