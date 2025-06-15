const axios = require('axios')
const { allQuery, runQuery } = require('./database')

// Service status types
const STATUS_TYPES = {
  OPERATIONAL: 'operational',
  DEGRADED: 'degraded',
  PARTIAL_OUTAGE: 'partial_outage',
  MAJOR_OUTAGE: 'major_outage',
  MAINTENANCE: 'maintenance'
}

// Check a single service
async function checkService(service) {
  const startTime = Date.now()
  
  try {
    // Special handling for different service types
    let requestConfig = {
      method: 'GET',
      url: service.url,
      timeout: service.timeout || 5000,
      validateStatus: (status) => status < 500 // Accept 4xx as operational, 5xx as outage
    }
    
    // Special handling for Upstash Redis
    if (service.id === 'upstash-redis') {
      // For Upstash Redis, we just check if the domain is reachable
      // A 401 or 403 response means the service is up but requires auth
      requestConfig.validateStatus = (status) => status < 500 || status === 401 || status === 403
    }
    
    const response = await axios(requestConfig)
    
    const responseTime = Date.now() - startTime
    const statusCode = response.status
    
    let status = STATUS_TYPES.OPERATIONAL
    
    // Determine status based on response time and status code
    if (statusCode >= 500) {
      status = STATUS_TYPES.MAJOR_OUTAGE
    } else if (statusCode >= 400) {
      // 401/403 are acceptable for services that require auth
      if (statusCode === 401 || statusCode === 403) {
        status = STATUS_TYPES.OPERATIONAL
      } else {
        status = STATUS_TYPES.DEGRADED
      }
    } else if (responseTime > 5000) {
      status = STATUS_TYPES.DEGRADED
    } else if (responseTime > 2000) {
      status = STATUS_TYPES.DEGRADED
    }
    
    // Save status to database
    await runQuery(
      `INSERT INTO service_status (service_id, status, response_time, status_code, checked_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [service.id, status, responseTime, statusCode]
    )
    
    console.log(`✅ ${service.name}: ${status} (${responseTime}ms, ${statusCode})`)
    
    return {
      serviceId: service.id,
      status,
      responseTime,
      statusCode,
      error: null
    }
    
  } catch (error) {
    const responseTime = Date.now() - startTime
    const errorMessage = error.message
    
    // Save error status to database
    await runQuery(
      `INSERT INTO service_status (service_id, status, response_time, error_message, checked_at) 
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [service.id, STATUS_TYPES.MAJOR_OUTAGE, responseTime, errorMessage]
    )
    
    console.log(`❌ ${service.name}: ${STATUS_TYPES.MAJOR_OUTAGE} (${errorMessage})`)
    
    return {
      serviceId: service.id,
      status: STATUS_TYPES.MAJOR_OUTAGE,
      responseTime,
      statusCode: null,
      error: errorMessage
    }
  }
}

// Check all services
async function checkAllServices() {
  try {
    const services = await allQuery('SELECT * FROM services WHERE url IS NOT NULL')
    
    console.log(`🔍 Checking ${services.length} services...`)
    
    const results = await Promise.allSettled(
      services.map(service => checkService(service))
    )
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`📊 Check completed: ${successful} successful, ${failed} failed`)
    
    // Clean up old status entries (keep last 1000 per service)
    await cleanupOldStatuses()
    
  } catch (error) {
    console.error('❌ Error checking services:', error)
  }
}

// Clean up old status entries
async function cleanupOldStatuses() {
  try {
    await runQuery(`
      DELETE FROM service_status 
      WHERE id NOT IN (
        SELECT id FROM service_status 
        ORDER BY checked_at DESC 
        LIMIT 10000
      )
    `)
  } catch (error) {
    console.error('Error cleaning up old statuses:', error)
  }
}

// Get current status for all services
async function getCurrentStatus() {
  try {
    const services = await allQuery(`
      SELECT 
        s.*,
        ss.status,
        ss.response_time,
        ss.status_code,
        ss.error_message,
        ss.checked_at
      FROM services s
      LEFT JOIN (
        SELECT DISTINCT service_id,
               FIRST_VALUE(status) OVER (PARTITION BY service_id ORDER BY checked_at DESC) as status,
               FIRST_VALUE(response_time) OVER (PARTITION BY service_id ORDER BY checked_at DESC) as response_time,
               FIRST_VALUE(status_code) OVER (PARTITION BY service_id ORDER BY checked_at DESC) as status_code,
               FIRST_VALUE(error_message) OVER (PARTITION BY service_id ORDER BY checked_at DESC) as error_message,
               FIRST_VALUE(checked_at) OVER (PARTITION BY service_id ORDER BY checked_at DESC) as checked_at
        FROM service_status
      ) ss ON s.id = ss.service_id
    `)
    
    // Group by category
    const categories = {}
    services.forEach(service => {
      if (!categories[service.category]) {
        categories[service.category] = {
          id: service.category,
          name: getCategoryName(service.category),
          description: getCategoryDescription(service.category),
          services: []
        }
      }
      
      categories[service.category].services.push({
        id: service.id,
        name: service.name,
        description: service.description,
        status: service.status || STATUS_TYPES.OPERATIONAL,
        category: service.category,
        url: service.url,
        lastChecked: service.checked_at || new Date().toISOString(),
        responseTime: service.response_time,
        statusCode: service.status_code,
        errorMessage: service.error_message
      })
    })
    
    return Object.values(categories)
  } catch (error) {
    console.error('Error getting current status:', error)
    return []
  }
}

// Helper functions
function getCategoryName(category) {
  const names = {
    website: 'Website & Frontend',
    authentication: 'Authentifizierung',
    database: 'Datenbank & Storage',
    apis: 'APIs & Services'
  }
  return names[category] || category
}

function getCategoryDescription(category) {
  const descriptions = {
    website: 'Hauptwebsite und Benutzeroberfläche',
    authentication: 'Benutzeranmeldung und -verwaltung',
    database: 'Datenspeicherung und -verwaltung',
    apis: 'Backend-APIs und externe Services'
  }
  return descriptions[category] || ''
}

// Calculate overall status
function calculateOverallStatus(categories) {
  const allServices = categories.flatMap(cat => cat.services)
  
  if (allServices.some(service => service.status === STATUS_TYPES.MAJOR_OUTAGE)) {
    return STATUS_TYPES.MAJOR_OUTAGE
  }
  if (allServices.some(service => service.status === STATUS_TYPES.PARTIAL_OUTAGE)) {
    return STATUS_TYPES.PARTIAL_OUTAGE
  }
  if (allServices.some(service => service.status === STATUS_TYPES.DEGRADED)) {
    return STATUS_TYPES.DEGRADED
  }
  if (allServices.some(service => service.status === STATUS_TYPES.MAINTENANCE)) {
    return STATUS_TYPES.MAINTENANCE
  }
  
  return STATUS_TYPES.OPERATIONAL
}

// Start monitoring
function startMonitoring() {
  // Get check interval from environment or default to 5 seconds
  const checkInterval = process.env.CHECK_INTERVAL || 5000
  
  // Check services at specified interval
  setInterval(() => {
    checkAllServices()
  }, parseInt(checkInterval))
  
  // Initial check
  setTimeout(() => {
    checkAllServices()
  }, 2000) // Wait 2 seconds after startup
  
  console.log(`📅 Monitoring scheduled: every ${checkInterval}ms (${checkInterval/1000} seconds)`)
}

module.exports = {
  startMonitoring,
  checkAllServices,
  getCurrentStatus,
  calculateOverallStatus,
  STATUS_TYPES
}