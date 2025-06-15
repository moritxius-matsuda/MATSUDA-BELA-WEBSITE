const express = require('express')
const { runQuery, allQuery, getQuery } = require('../database')

const router = express.Router()

// Get all maintenance windows
router.get('/', async (req, res) => {
  try {
    const maintenance = await allQuery(`
      SELECT * FROM maintenance 
      ORDER BY scheduled_start DESC
    `)
    
    const formattedMaintenance = maintenance.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      scheduledStart: m.scheduled_start,
      scheduledEnd: m.scheduled_end,
      actualStart: m.actual_start,
      actualEnd: m.actual_end,
      status: m.status,
      affectedServices: JSON.parse(m.affected_services || '[]'),
      createdAt: m.created_at,
      updatedAt: m.updated_at
    }))
    
    res.json(formattedMaintenance)
  } catch (error) {
    console.error('Error getting maintenance:', error)
    res.status(500).json({ error: 'Failed to get maintenance windows' })
  }
})

// Create new maintenance window
router.post('/', async (req, res) => {
  try {
    const { title, description, scheduledStart, scheduledEnd, affectedServices } = req.body
    
    if (!title || !description || !scheduledStart || !scheduledEnd) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    
    const maintenanceId = `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    await runQuery(`
      INSERT INTO maintenance (id, title, description, scheduled_start, scheduled_end, status, affected_services)
      VALUES (?, ?, ?, ?, ?, 'scheduled', ?)
    `, [maintenanceId, title, description, scheduledStart, scheduledEnd, JSON.stringify(affectedServices || [])])
    
    const maintenance = await getMaintenanceById(maintenanceId)
    
    res.status(201).json(maintenance)
  } catch (error) {
    console.error('Error creating maintenance:', error)
    res.status(500).json({ error: 'Failed to create maintenance window' })
  }
})

// Update maintenance status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, actualStart, actualEnd } = req.body
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }
    
    const updateFields = ['status = ?', 'updated_at = CURRENT_TIMESTAMP']
    const updateValues = [status]
    
    if (actualStart) {
      updateFields.push('actual_start = ?')
      updateValues.push(actualStart)
    }
    
    if (actualEnd) {
      updateFields.push('actual_end = ?')
      updateValues.push(actualEnd)
    }
    
    updateValues.push(id)
    
    await runQuery(`
      UPDATE maintenance 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues)
    
    const maintenance = await getMaintenanceById(id)
    
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance window not found' })
    }
    
    res.json(maintenance)
  } catch (error) {
    console.error('Error updating maintenance:', error)
    res.status(500).json({ error: 'Failed to update maintenance window' })
  }
})

// Delete maintenance window
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await runQuery('DELETE FROM maintenance WHERE id = ?', [id])
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Maintenance window not found' })
    }
    
    res.json({ message: 'Maintenance window deleted successfully' })
  } catch (error) {
    console.error('Error deleting maintenance:', error)
    res.status(500).json({ error: 'Failed to delete maintenance window' })
  }
})

// Helper function
async function getMaintenanceById(id) {
  const maintenance = await getQuery('SELECT * FROM maintenance WHERE id = ?', [id])
  
  if (!maintenance) return null
  
  return {
    id: maintenance.id,
    title: maintenance.title,
    description: maintenance.description,
    scheduledStart: maintenance.scheduled_start,
    scheduledEnd: maintenance.scheduled_end,
    actualStart: maintenance.actual_start,
    actualEnd: maintenance.actual_end,
    status: maintenance.status,
    affectedServices: JSON.parse(maintenance.affected_services || '[]'),
    createdAt: maintenance.created_at,
    updatedAt: maintenance.updated_at
  }
}

module.exports = router