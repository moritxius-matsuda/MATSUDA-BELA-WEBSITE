const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
require('dotenv').config()

const { initDatabase } = require('./src/database')
const { startMonitoring } = require('./src/monitor')
const statusRoutes = require('./src/routes/status')
const incidentRoutes = require('./src/routes/incidents')
const maintenanceRoutes = require('./src/routes/maintenance')
const historyRoutes = require('./src/routes/history')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(compression())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://moritxius.de'],
  credentials: true
}))
app.use(express.json())

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API Routes
app.use('/api/status', statusRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/maintenance', maintenanceRoutes)
app.use('/api', historyRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  })
})

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase()
    console.log('✅ Database initialized')
    
    // Start monitoring services
    startMonitoring()
    console.log('✅ Monitoring started')
    
    app.listen(PORT, () => {
      console.log(`🚀 Status monitoring server running on port ${PORT}`)
      console.log(`📊 Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

startServer()