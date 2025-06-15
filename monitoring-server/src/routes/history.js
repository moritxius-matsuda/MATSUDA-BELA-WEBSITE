const express = require('express')
const { allQuery } = require('../database')

const router = express.Router()

// Get historical status data for timeline
router.get('/history', async (req, res) => {
  try {
    const { service, days = 90 } = req.query
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))
    
    let query = `
      SELECT 
        DATE(checked_at) as date,
        service_id,
        AVG(response_time) as avg_response_time,
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational_checks,
        SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded_checks,
        SUM(CASE WHEN status = 'partial_outage' THEN 1 ELSE 0 END) as partial_outage_checks,
        SUM(CASE WHEN status = 'major_outage' THEN 1 ELSE 0 END) as major_outage_checks,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_checks
      FROM status_checks 
      WHERE checked_at >= ? AND checked_at <= ?
    `
    
    const params = [startDate.toISOString(), endDate.toISOString()]
    
    if (service) {
      query += ' AND service_id = ?'
      params.push(service)
    }
    
    query += ' GROUP BY DATE(checked_at), service_id ORDER BY date DESC'
    
    const results = await allQuery(query, params)
    
    // Process results to calculate daily status and uptime
    const processedData = results.map(row => {
      const totalChecks = row.total_checks
      const operationalChecks = row.operational_checks
      const degradedChecks = row.degraded_checks
      const partialOutageChecks = row.partial_outage_checks
      const majorOutageChecks = row.major_outage_checks
      const maintenanceChecks = row.maintenance_checks
      
      // Calculate uptime percentage
      const uptime = totalChecks > 0 ? 
        ((operationalChecks + degradedChecks * 0.8 + maintenanceChecks) / totalChecks) * 100 : 100
      
      // Determine overall status for the day
      let status = 'operational'
      if (majorOutageChecks > totalChecks * 0.1) { // More than 10% major outage
        status = 'major_outage'
      } else if (partialOutageChecks > totalChecks * 0.1) { // More than 10% partial outage
        status = 'partial_outage'
      } else if (degradedChecks > totalChecks * 0.2) { // More than 20% degraded
        status = 'degraded'
      } else if (maintenanceChecks > totalChecks * 0.1) { // More than 10% maintenance
        status = 'maintenance'
      }
      
      return {
        date: row.date,
        service_id: row.service_id,
        status,
        uptime: Math.round(uptime * 100) / 100,
        incidents: majorOutageChecks + partialOutageChecks,
        responseTime: Math.round(row.avg_response_time || 0),
        totalChecks
      }
    })
    
    // If no data available, generate mock data for demonstration
    if (processedData.length === 0) {
      const mockData = generateMockHistoryData(parseInt(days), service)
      return res.json(mockData)
    }
    
    res.json(processedData)
    
  } catch (error) {
    console.error('Error fetching history data:', error)
    res.status(500).json({ error: 'Failed to fetch history data' })
  }
})

// Generate mock historical data for demonstration
function generateMockHistoryData(days, serviceId) {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Simulate realistic uptime data
    const random = Math.random()
    let status = 'operational'
    let uptime = 100
    let incidents = 0
    
    if (random < 0.02) { // 2% chance of major outage
      status = 'major_outage'
      uptime = Math.random() * 50 + 20 // 20-70% uptime
      incidents = Math.floor(Math.random() * 3) + 1
    } else if (random < 0.05) { // 3% chance of degraded
      status = 'degraded'
      uptime = Math.random() * 20 + 80 // 80-100% uptime
      incidents = Math.floor(Math.random() * 2)
    } else if (random < 0.07) { // 2% chance of partial outage
      status = 'partial_outage'
      uptime = Math.random() * 30 + 60 // 60-90% uptime
      incidents = Math.floor(Math.random() * 2) + 1
    } else if (random < 0.08) { // 1% chance of maintenance
      status = 'maintenance'
      uptime = 95 + Math.random() * 5 // 95-100% uptime
      incidents = 0
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      service_id: serviceId || 'all',
      status,
      uptime: Math.round(uptime * 100) / 100,
      incidents,
      responseTime: Math.floor(Math.random() * 200) + 50, // 50-250ms
      totalChecks: 288 // 24 hours * 12 checks per hour (5-second intervals)
    })
  }
  
  return data
}

module.exports = router