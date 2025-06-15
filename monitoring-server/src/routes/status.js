const express = require('express')
const { getCurrentStatus, calculateOverallStatus } = require('../monitor')
const { allQuery } = require('../database')

const router = express.Router()

// Get current system status
router.get('/', async (req, res) => {
  try {
    const [categories, incidents, maintenance] = await Promise.all([
      getCurrentStatus(),
      getRecentIncidents(),
      getUpcomingMaintenance()
    ])
    
    const overallStatus = calculateOverallStatus(categories)
    
    res.json({
      overall: overallStatus,
      categories,
      incidents,
      maintenance,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error getting status:', error)
    res.status(500).json({ error: 'Failed to get status' })
  }
})

// Get status for a specific service
router.get('/service/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params
    const limit = parseInt(req.query.limit) || 100
    
    const statusHistory = await allQuery(`
      SELECT status, response_time, status_code, error_message, checked_at
      FROM service_status 
      WHERE service_id = ?
      ORDER BY checked_at DESC
      LIMIT ?
    `, [serviceId, limit])
    
    res.json(statusHistory)
  } catch (error) {
    console.error('Error getting service status:', error)
    res.status(500).json({ error: 'Failed to get service status' })
  }
})

// Get uptime statistics
router.get('/uptime/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params
    const days = parseInt(req.query.days) || 30
    
    const stats = await allQuery(`
      SELECT 
        DATE(checked_at) as date,
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as successful_checks,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time
      FROM service_status 
      WHERE service_id = ? 
        AND checked_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(checked_at)
      ORDER BY date DESC
    `, [serviceId, days])
    
    // Calculate uptime percentage
    const uptimeStats = stats.map(stat => ({
      ...stat,
      uptime_percentage: (stat.successful_checks / stat.total_checks) * 100
    }))
    
    res.json(uptimeStats)
  } catch (error) {
    console.error('Error getting uptime stats:', error)
    res.status(500).json({ error: 'Failed to get uptime statistics' })
  }
})

// Helper functions
async function getRecentIncidents() {
  try {
    const incidents = await allQuery(`
      SELECT i.*, 
             GROUP_CONCAT(iu.message || '|' || iu.status || '|' || iu.created_at, '###') as updates
      FROM incidents i
      LEFT JOIN incident_updates iu ON i.id = iu.incident_id
      WHERE i.created_at >= datetime('now', '-30 days')
      GROUP BY i.id
      ORDER BY i.created_at DESC
      LIMIT 10
    `)
    
    return incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      status: incident.status,
      impact: incident.impact,
      affectedServices: JSON.parse(incident.affected_services || '[]'),
      createdAt: incident.created_at,
      updatedAt: incident.updated_at,
      resolvedAt: incident.resolved_at,
      updates: parseUpdates(incident.updates)
    }))
  } catch (error) {
    console.error('Error getting incidents:', error)
    return []
  }
}

async function getUpcomingMaintenance() {
  try {
    const maintenance = await allQuery(`
      SELECT * FROM maintenance 
      WHERE scheduled_end >= datetime('now')
      ORDER BY scheduled_start ASC
      LIMIT 5
    `)
    
    return maintenance.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      scheduledStart: m.scheduled_start,
      scheduledEnd: m.scheduled_end,
      actualStart: m.actual_start,
      actualEnd: m.actual_end,
      status: m.status,
      affectedServices: JSON.parse(m.affected_services || '[]')
    }))
  } catch (error) {
    console.error('Error getting maintenance:', error)
    return []
  }
}

function parseUpdates(updatesString) {
  if (!updatesString) return []
  
  return updatesString.split('###').map(update => {
    const [message, status, timestamp] = update.split('|')
    return {
      id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      status,
      timestamp
    }
  })
}

module.exports = router