const express = require('express')
const { runQuery, allQuery, getQuery } = require('../database')

const router = express.Router()

// Get all incidents
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50 } = req.query
    
    console.log(`Fetching incidents with status: ${status}, limit: ${limit}`)
    
    let query = `
      SELECT i.*, 
             GROUP_CONCAT(iu.message || '|' || iu.status || '|' || iu.created_at, '###') as updates
      FROM incidents i
      LEFT JOIN incident_updates iu ON i.id = iu.incident_id
    `
    
    const params = []
    
    // Filter by status if specified
    if (status === 'active') {
      query += ` WHERE i.status IN ('investigating', 'identified', 'monitoring')`
    } else if (status === 'resolved') {
      query += ` WHERE i.status = 'resolved'`
    } else if (status) {
      query += ` WHERE i.status = ?`
      params.push(status)
    }
    
    query += ` GROUP BY i.id ORDER BY i.created_at DESC LIMIT ?`
    params.push(parseInt(limit))
    
    const incidents = await allQuery(query, params)
    
    const formattedIncidents = incidents.map(incident => ({
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
    
    res.json(formattedIncidents)
  } catch (error) {
    console.error('Error getting incidents:', error)
    res.status(500).json({ error: 'Failed to get incidents' })
  }
})

// Create new incident
router.post('/', async (req, res) => {
  try {
    const { title, description, impact, affectedServices } = req.body
    
    if (!title || !description || !impact) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Create incident
    await runQuery(`
      INSERT INTO incidents (id, title, description, status, impact, affected_services)
      VALUES (?, ?, ?, 'investigating', ?, ?)
    `, [incidentId, title, description, impact, JSON.stringify(affectedServices || [])])
    
    // Create initial update
    await runQuery(`
      INSERT INTO incident_updates (id, incident_id, message, status)
      VALUES (?, ?, ?, 'investigating')
    `, [updateId, incidentId, description])
    
    // Get the created incident
    const incident = await getIncidentById(incidentId)
    
    res.status(201).json(incident)
  } catch (error) {
    console.error('Error creating incident:', error)
    res.status(500).json({ error: 'Failed to create incident' })
  }
})

// Update incident
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { message, status } = req.body
    
    if (!message || !status) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const updateId = `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Add update
    await runQuery(`
      INSERT INTO incident_updates (id, incident_id, message, status)
      VALUES (?, ?, ?, ?)
    `, [updateId, id, message, status])
    
    // Update incident status and timestamp
    const updateData = {
      status,
      updated_at: new Date().toISOString()
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
    }
    
    await runQuery(`
      UPDATE incidents 
      SET status = ?, updated_at = ?${status === 'resolved' ? ', resolved_at = ?' : ''}
      WHERE id = ?
    `, status === 'resolved' 
      ? [status, updateData.updated_at, updateData.resolved_at, id]
      : [status, updateData.updated_at, id]
    )
    
    // Get updated incident
    const incident = await getIncidentById(id)
    
    res.json(incident)
  } catch (error) {
    console.error('Error updating incident:', error)
    res.status(500).json({ error: 'Failed to update incident' })
  }
})

// Delete incident
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // Delete updates first
    await runQuery('DELETE FROM incident_updates WHERE incident_id = ?', [id])
    
    // Delete incident
    const result = await runQuery('DELETE FROM incidents WHERE id = ?', [id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Incident not found' })
    }
    
    res.json({ message: 'Incident deleted successfully' })
  } catch (error) {
    console.error('Error deleting incident:', error)
    res.status(500).json({ error: 'Failed to delete incident' })
  }
})

// Helper functions
async function getIncidentById(id) {
  const incident = await getQuery(`
    SELECT i.*, 
           GROUP_CONCAT(iu.message || '|' || iu.status || '|' || iu.created_at, '###') as updates
    FROM incidents i
    LEFT JOIN incident_updates iu ON i.id = iu.incident_id
    WHERE i.id = ?
    GROUP BY i.id
  `, [id])
  
  if (!incident) return null
  
  return {
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
  }).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

module.exports = router