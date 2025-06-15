import { NextRequest, NextResponse } from 'next/server'

const MONITORING_SERVER_URL = process.env.MONITORING_SERVER_URL || 'http://localhost:3001'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    console.log(`Updating incident ${id} with:`, body)
    
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Monitoring server error: ${response.status} - ${errorText}`)
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully updated incident ${id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating incident:', error)
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`Deleting incident ${id}`)
    
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Monitoring server error: ${response.status} - ${errorText}`)
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    console.log(`Successfully deleted incident ${id}`)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting incident:', error)
    return NextResponse.json(
      { error: 'Failed to delete incident' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    console.log(`Getting incident ${id}`)
    
    const response = await fetch(`${MONITORING_SERVER_URL}/api/incidents/${id}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Monitoring server error: ${response.status} - ${errorText}`)
      throw new Error(`Monitoring server responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Successfully retrieved incident ${id}`)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error getting incident:', error)
    return NextResponse.json(
      { error: 'Failed to get incident' },
      { status: 500 }
    )
  }
}