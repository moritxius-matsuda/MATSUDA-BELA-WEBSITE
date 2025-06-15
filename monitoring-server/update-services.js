const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const DB_PATH = path.join(__dirname, 'data/status.db')

// Update service URLs
const updates = [
  {
    id: 'upstash-redis',
    url: 'https://epic-werewolf-17800.upstash.io'
  },
  {
    id: 'main-website',
    url: 'https://moritxius.de'
  },
  {
    id: 'guides-system',
    url: 'https://moritxius.de/guides'
  },
  {
    id: 'comments-api',
    url: 'https://moritxius.de/api/comments'
  },
  {
    id: 'guides-api',
    url: 'https://moritxius.de/api/guides'
  }
]

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err)
    process.exit(1)
  }
  
  console.log('Connected to database')
  
  // Update each service
  let completed = 0
  updates.forEach((update) => {
    db.run(
      'UPDATE services SET url = ? WHERE id = ?',
      [update.url, update.id],
      function(err) {
        if (err) {
          console.error(`Error updating ${update.id}:`, err)
        } else {
          console.log(`✅ Updated ${update.id}: ${update.url}`)
        }
        
        completed++
        if (completed === updates.length) {
          console.log('All services updated!')
          db.close()
        }
      }
    )
  })
})