const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const DB_PATH = path.join(__dirname, '../data/status.db')
let db = null

// Initialize database
function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err)
        return
      }
      
      console.log('Connected to SQLite database')
      createTables()
        .then(resolve)
        .catch(reject)
    })
  })
}

// Create tables
function createTables() {
  return new Promise((resolve, reject) => {
    const queries = [
      // Services table
      `CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        url TEXT,
        category TEXT NOT NULL,
        check_interval INTEGER DEFAULT 60,
        timeout INTEGER DEFAULT 5000,
        expected_status INTEGER DEFAULT 200,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Service status table
      `CREATE TABLE IF NOT EXISTS service_status (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_id TEXT NOT NULL,
        status TEXT NOT NULL,
        response_time INTEGER,
        status_code INTEGER,
        error_message TEXT,
        checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (service_id) REFERENCES services (id)
      )`,
      
      // Incidents table
      `CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL,
        impact TEXT NOT NULL,
        affected_services TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME
      )`,
      
      // Incident updates table
      `CREATE TABLE IF NOT EXISTS incident_updates (
        id TEXT PRIMARY KEY,
        incident_id TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents (id)
      )`,
      
      // Maintenance windows table
      `CREATE TABLE IF NOT EXISTS maintenance (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        scheduled_start DATETIME NOT NULL,
        scheduled_end DATETIME NOT NULL,
        actual_start DATETIME,
        actual_end DATETIME,
        status TEXT NOT NULL,
        affected_services TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ]
    
    let completed = 0
    queries.forEach((query) => {
      db.run(query, (err) => {
        if (err) {
          reject(err)
          return
        }
        completed++
        if (completed === queries.length) {
          insertDefaultServices()
            .then(resolve)
            .catch(reject)
        }
      })
    })
  })
}

// Insert default services
function insertDefaultServices() {
  return new Promise((resolve, reject) => {
    const defaultServices = [
      {
        id: 'main-website',
        name: 'Hauptwebsite',
        description: 'moritxius.de Hauptseite',
        url: 'https://moritxius.de',
        category: 'website'
      },
      {
        id: 'guides-system',
        name: 'Guides System',
        description: 'Anleitungen und Tutorials',
        url: 'https://moritxius.de/api/health',
        category: 'website'
      },
      {
        id: 'clerk-auth',
        name: 'Clerk Authentication',
        description: 'Benutzeranmeldung über Clerk',
        url: 'https://api.clerk.dev/v1/health',
        category: 'authentication'
      },
      {
        id: 'upstash-redis',
        name: 'Upstash Redis',
        description: 'Kommentare und Cache-Speicher',
        url: process.env.UPSTASH_REDIS_REST_URL,
        category: 'database'
      },
      {
        id: 'comments-api',
        name: 'Kommentar API',
        description: 'API für Kommentare und Bewertungen',
        url: 'https://moritxius.de/api/comments',
        category: 'apis'
      },
      {
        id: 'guides-api',
        name: 'Guides API',
        description: 'API für Anleitungen und Inhalte',
        url: 'https://moritxius.de/api/guides',
        category: 'apis'
      }
    ]
    
    const insertQuery = `INSERT OR IGNORE INTO services (id, name, description, url, category) VALUES (?, ?, ?, ?, ?)`
    
    let completed = 0
    defaultServices.forEach((service) => {
      db.run(insertQuery, [service.id, service.name, service.description, service.url, service.category], (err) => {
        if (err) {
          console.error('Error inserting service:', err)
        }
        completed++
        if (completed === defaultServices.length) {
          resolve()
        }
      })
    })
  })
}

// Database helper functions
function getDb() {
  return db
}

function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ id: this.lastID, changes: this.changes })
      }
    })
  })
}

function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

module.exports = {
  initDatabase,
  getDb,
  runQuery,
  getQuery,
  allQuery
}