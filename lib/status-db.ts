import { Redis } from '@upstash/redis'
import { StatusIncident, MaintenanceWindow, Service } from '@/types/status'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Keys für Redis
const INCIDENTS_KEY = 'status:incidents'
const MAINTENANCE_KEY = 'status:maintenance'
const SERVICES_KEY = 'status:services'

// Incident Management
export async function createIncident(incident: Omit<StatusIncident, 'id' | 'createdAt' | 'updatedAt'>): Promise<StatusIncident> {
  const id = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()
  
  const newIncident: StatusIncident = {
    ...incident,
    id,
    createdAt: now,
    updatedAt: now,
    updates: [{
      id: `update_${Date.now()}`,
      message: incident.description,
      status: incident.status,
      timestamp: now
    }]
  }

  await redis.hset(INCIDENTS_KEY, { [id]: JSON.stringify(newIncident) })
  return newIncident
}

export async function updateIncident(id: string, update: { message: string; status: StatusIncident['status'] }): Promise<StatusIncident | null> {
  const incidentData = await redis.hget(INCIDENTS_KEY, id)
  if (!incidentData) return null

  const incident: StatusIncident = JSON.parse(incidentData as string)
  const now = new Date().toISOString()
  
  const newUpdate = {
    id: `update_${Date.now()}`,
    message: update.message,
    status: update.status,
    timestamp: now
  }

  const updatedIncident: StatusIncident = {
    ...incident,
    status: update.status,
    updatedAt: now,
    updates: [...incident.updates, newUpdate]
  }

  await redis.hset(INCIDENTS_KEY, { [id]: JSON.stringify(updatedIncident) })
  return updatedIncident
}

export async function getIncidents(): Promise<StatusIncident[]> {
  const incidents = await redis.hgetall(INCIDENTS_KEY)
  if (!incidents) return []

  return Object.values(incidents)
    .map(data => JSON.parse(data as string))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export async function deleteIncident(id: string): Promise<boolean> {
  const result = await redis.hdel(INCIDENTS_KEY, id)
  return result === 1
}

// Maintenance Management
export async function createMaintenance(maintenance: Omit<MaintenanceWindow, 'id'>): Promise<MaintenanceWindow> {
  const id = `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  const newMaintenance: MaintenanceWindow = {
    ...maintenance,
    id
  }

  await redis.hset(MAINTENANCE_KEY, { [id]: JSON.stringify(newMaintenance) })
  return newMaintenance
}

export async function getMaintenance(): Promise<MaintenanceWindow[]> {
  const maintenance = await redis.hgetall(MAINTENANCE_KEY)
  if (!maintenance) return []

  return Object.values(maintenance)
    .map(data => JSON.parse(data as string))
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceWindow['status']): Promise<MaintenanceWindow | null> {
  const maintenanceData = await redis.hget(MAINTENANCE_KEY, id)
  if (!maintenanceData) return null

  const maintenance: MaintenanceWindow = JSON.parse(maintenanceData as string)
  const updatedMaintenance: MaintenanceWindow = {
    ...maintenance,
    status
  }

  await redis.hset(MAINTENANCE_KEY, { [id]: JSON.stringify(updatedMaintenance) })
  return updatedMaintenance
}

export async function deleteMaintenance(id: string): Promise<boolean> {
  const result = await redis.hdel(MAINTENANCE_KEY, id)
  return result === 1
}

// Service Status Management
export async function updateServiceStatus(serviceId: string, status: Service['status'], responseTime?: number): Promise<void> {
  const serviceUpdate = {
    status,
    responseTime,
    lastChecked: new Date().toISOString()
  }
  
  await redis.hset(SERVICES_KEY, { [serviceId]: JSON.stringify(serviceUpdate) })
}

export async function getServiceStatuses(): Promise<Record<string, { status: Service['status']; responseTime?: number; lastChecked: string }>> {
  const services = await redis.hgetall(SERVICES_KEY)
  if (!services) return {}

  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(services)) {
    result[key] = JSON.parse(value as string)
  }
  
  return result
}