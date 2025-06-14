import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { get, put } from '@vercel/blob'

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
    const commentId = searchParams.get('commentId')
    
    if (!slug || !commentId) {
      return NextResponse.json({ error: 'Slug and commentId are required' }, { status: 400 })
    }

    const body = await request.json()
    const { voteType } = body

    if (!voteType || !['like', 'dislike'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 })
    }

    // Get existing comment
    const commentResponse = await get(`comments/${slug}/${commentId}.json`)
    const comment = await commentResponse.json()

    // Update likes/dislikes
    const newLikes = voteType === 'like' ? comment.likes + 1 : comment.likes
    const newDislikes = voteType === 'dislike' ? comment.dislikes + 1 : comment.dislikes

    // Save updated comment
    await put(`comments/${slug}/${commentId}.json`, JSON.stringify({
      ...comment,
      likes: newLikes,
      dislikes: newDislikes
    }))

    return NextResponse.json({ likes: newLikes, dislikes: newDislikes })
  } catch (error) {
    console.error('Error updating vote:', error)
    return NextResponse.json({ error: 'Failed to update vote' }, { status: 500 })
  }
}
