import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { put, list, get } from '@vercel/blob'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const comments = []
    const { blobs } = await list({ prefix: `comments/${slug}/` })
    
    for (const blob of blobs) {
      if (blob.pathname.endsWith('.json')) {
        const response = await get(blob.pathname)
        const comment = await response.json()
        comments.push(comment)
      }
    }

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const body = await request.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const user = await auth().getUser()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // Generate a unique comment ID
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2)}`
    const comment = {
      id: commentId,
      content,
      author: user.fullName || user.emailAddresses[0]?.emailAddress || 'Anonymous',
      authorId: user.id,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0
    }

    // Save comment to Vercel Blob
    await put(`comments/${slug}/${commentId}.json`, JSON.stringify(comment))

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
