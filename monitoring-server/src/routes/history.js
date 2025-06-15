const express = require('express')
const { allQuery } = require('../database')

const router = express.Router()

// Test endpoint to verify history API is working
router.get('/history/test', (req, res) => {
  res.json({
    status: 'ok',
    message: 'History API is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/history - Get historical data',
      'GET /api/history/test - Test endpoint'
    ]
  })
})

// Get historical status data for timeline
router.get('/history', async (req, res) => {
  try {
    const { service, days = 90 } = req.query
    
    console.log(`Fetching REAL history data for service: ${service}, days: ${days}`)
    
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
    
    if (service && service !== 'all') {
      query += ' AND service_id = ?'
      params.push(service)
    }
    
    query += ' GROUP BY DATE(checked_at), service_id ORDER BY date DESC'
    
    console.log('Executing query:', query)
    console.log('With params:', params)
    
    const results = await allQuery(query, params)
    console.log(`Query returned ${results.length} rows`)
    
    // Process results to calculate daily status and uptime
    const processedData = results.map(row => {
      const totalChecks = row.total_checks
      const operationalChecks = row.operational_checks || 0
      const degradedChecks = row.degraded_checks || 0
      const partialOutageChecks = row.partial_outage_checks || 0
      const majorOutageChecks = row.major_outage_checks || 0
      const maintenanceChecks = row.maintenance_checks || 0
      
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
    
    console.log(`Processed ${processedData.length} days of real data`)
    
    // If no historical data available, return empty array or minimal data
    if (processedData.length === 0) {
      console.log('No historical data found - returning empty array')
      
      // Generate minimal data for today only if no data exists
      const today = new Date().toISOString().split('T')[0]
      const minimalData = [{
        date: today,
        service_id: service || 'unknown',
        status: 'operational',
        uptime: 100,
        incidents: 0,
        responseTime: 0,
        totalChecks: 0
      }]
      
      return res.json(minimalData)
    }
    
    res.json(processedData)
    
  } catch (error) {
    console.error('Error fetching real history data:', error)
    res.status(500).json({ 
      error: 'Failed to fetch history data',
      details: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// No mock data - only real data from database

module.exports = router