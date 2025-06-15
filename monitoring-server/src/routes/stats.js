const express = require('express')
const { allQuery, getQuery } = require('../database')

const router = express.Router()

// Get overall statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('Calculating real statistics from database')
    
    // Calculate uptime for last 90 days
    const uptimeQuery = `
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational_checks,
        SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded_checks,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_checks
      FROM status_checks 
      WHERE checked_at >= datetime('now', '-90 days')
    `
    
    const uptimeResult = await getQuery(uptimeQuery)
    
    // Calculate average response time for last 24 hours
    const responseTimeQuery = `
      SELECT AVG(response_time) as avg_response_time
      FROM status_checks 
      WHERE checked_at >= datetime('now', '-1 day')
      AND response_time IS NOT NULL
    `
    
    const responseTimeResult = await getQuery(responseTimeQuery)
    
    // Count incidents in last 30 days
    const incidentsQuery = `
      SELECT COUNT(*) as incident_count
      FROM status_checks 
      WHERE checked_at >= datetime('now', '-30 days')
      AND status IN ('major_outage', 'partial_outage')
    `
    
    const incidentsResult = await getQuery(incidentsQuery)
    
    // Count planned maintenance
    const maintenanceQuery = `
      SELECT COUNT(*) as maintenance_count
      FROM maintenance 
      WHERE status = 'scheduled'
      AND scheduled_start >= datetime('now')
    `
    
    const maintenanceResult = await getQuery(maintenanceQuery)
    
    // Calculate uptime percentage
    let uptime = 100
    if (uptimeResult && uptimeResult.total_checks > 0) {
      const operationalChecks = uptimeResult.operational_checks || 0
      const degradedChecks = uptimeResult.degraded_checks || 0
      const maintenanceChecks = uptimeResult.maintenance_checks || 0
      const totalChecks = uptimeResult.total_checks
      
      // Count degraded as 80% uptime, maintenance as 100%
      uptime = ((operationalChecks + degradedChecks * 0.8 + maintenanceChecks) / totalChecks) * 100
    }
    
    const stats = {
      uptime: Math.round(uptime * 100) / 100,
      avgResponseTime: Math.round(responseTimeResult?.avg_response_time || 0),
      incidents: incidentsResult?.incident_count || 0,
      maintenance: maintenanceResult?.maintenance_count || 0,
      dataPoints: {
        totalChecks: uptimeResult?.total_checks || 0,
        operationalChecks: uptimeResult?.operational_checks || 0,
        degradedChecks: uptimeResult?.degraded_checks || 0,
        maintenanceChecks: uptimeResult?.maintenance_checks || 0
      },
      calculatedAt: new Date().toISOString()
    }
    
    console.log('Calculated statistics:', stats)
    res.json(stats)
    
  } catch (error) {
    console.error('Error calculating statistics:', error)
    res.status(500).json({ 
      error: 'Failed to calculate statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Get detailed statistics for a specific service
router.get('/stats/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params
    const { days = 30 } = req.query
    
    console.log(`Calculating statistics for service: ${serviceId}, days: ${days}`)
    
    const query = `
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational_checks,
        SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded_checks,
        SUM(CASE WHEN status = 'partial_outage' THEN 1 ELSE 0 END) as partial_outage_checks,
        SUM(CASE WHEN status = 'major_outage' THEN 1 ELSE 0 END) as major_outage_checks,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_checks,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time
      FROM status_checks 
      WHERE service_id = ?
      AND checked_at >= datetime('now', '-${days} days')
    `
    
    const result = await getQuery(query, [serviceId])
    
    let uptime = 100
    if (result && result.total_checks > 0) {
      const operationalChecks = result.operational_checks || 0
      const degradedChecks = result.degraded_checks || 0
      const maintenanceChecks = result.maintenance_checks || 0
      const totalChecks = result.total_checks
      
      uptime = ((operationalChecks + degradedChecks * 0.8 + maintenanceChecks) / totalChecks) * 100
    }
    
    const stats = {
      serviceId,
      period: `${days} days`,
      uptime: Math.round(uptime * 100) / 100,
      totalChecks: result?.total_checks || 0,
      statusDistribution: {
        operational: result?.operational_checks || 0,
        degraded: result?.degraded_checks || 0,
        partial_outage: result?.partial_outage_checks || 0,
        major_outage: result?.major_outage_checks || 0,
        maintenance: result?.maintenance_checks || 0
      },
      responseTime: {
        average: Math.round(result?.avg_response_time || 0),
        minimum: result?.min_response_time || 0,
        maximum: result?.max_response_time || 0
      },
      calculatedAt: new Date().toISOString()
    }
    
    res.json(stats)
    
  } catch (error) {
    console.error('Error calculating service statistics:', error)
    res.status(500).json({ 
      error: 'Failed to calculate service statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router