// Configuration for Status Monitoring Server
require('dotenv').config()

module.exports = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  dbPath: process.env.DB_PATH || './data/status.db',
  
  // Monitoring Configuration
  checkInterval: parseInt(process.env.CHECK_INTERVAL) || 5000, // 5 seconds default
  retentionDays: parseInt(process.env.RETENTION_DAYS) || 30,
  
  // CORS Configuration
  allowedOrigins: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',') : 
    ['https://moritxius.de', 'http://localhost:3000'],
  
  // Service Timeout Configuration
  serviceTimeout: 5000, // 5 seconds timeout for service checks
  
  // External Services
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL || 'https://epic-werewolf-17800.upstash.io',
  
  // Optional: Notification Configuration
  discordWebhook: process.env.DISCORD_WEBHOOK_URL,
  slackWebhook: process.env.SLACK_WEBHOOK_URL,
  
  // Optional: Admin Configuration
  adminApiKey: process.env.ADMIN_API_KEY
}