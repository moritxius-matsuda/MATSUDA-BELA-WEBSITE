import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface Comment {
  id: string
  guideSlug: string
  userId: string
  userName: string
  userImage?: string
  content: string
  createdAt: string
  updatedAt: string
  likes: number
  dislikes: number
  userReactions: { [userId: string]: 'like' | 'dislike' }
  parentId?: string
  replies?: Comment[]
  replyCount: number
}

export interface GuideRating {
  guideSlug: string
  totalLikes: number
  totalDislikes: number
  userReactions: { [userId: string]: 'like' | 'dislike' }
  createdAt: string
  updatedAt: string
}

// KV Keys
const COMMENTS_KEY = (guideSlug: string) => `comments:${guideSlug}`
const RATING_KEY = (guideSlug: string) => `rating:${guideSlug}`

// Kommentar-Funktionen
export const getComments = async (guideSlug: string): Promise<Comment[]> => {
  try {
    if (!guideSlug) return []
    
    const allComments = await redis.get<Comment[]>(COMMENTS_KEY(guideSlug)) || []
    
    // Stelle sicher, dass alle Kommentare die erforderlichen Eigenschaften haben
    const validComments = allComments.map(comment => ({
      ...comment,
      userReactions: comment.userReactions || {},
      likes: comment.likes || 0,
      dislikes: comment.dislikes || 0,
      replyCount: 0 // Wird später berechnet
    }))
    
    // Organisiere Kommentare in einer Hierarchie
    const topLevelComments = validComments.filter(c => !c.parentId)
    const replies = validComments.filter(c => c.parentId)
    
    // Füge Antworten zu ihren Eltern-Kommentaren hinzu
    topLevelComments.forEach(comment => {
      comment.replies = replies.filter(r => r.parentId === comment.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      comment.replyCount = comment.replies.length
    })
    
    return topLevelComments
  } catch (error) {
    console.error('Error getting comments:', error)
    return []
  }
}

export const getAllComments = async (guideSlug: string): Promise<Comment[]> => {
  try {
    return await redis.get<Comment[]>(COMMENTS_KEY(guideSlug)) || []
  } catch (error) {
    console.error('Error getting all comments:', error)
    return []
  }
}

export const addComment = async (guideSlug: string, comment: Comment): Promise<void> => {
  try {
    const existingComments = await getAllComments(guideSlug)
    const updatedComments = [...existingComments, comment]
    await redis.set(COMMENTS_KEY(guideSlug), updatedComments)
  } catch (error) {
    console.error('Error adding comment:', error)
    throw error
  }
}

export const getComment = async (guideSlug: string, commentId: string): Promise<Comment | undefined> => {
  try {
    const comments = await getAllComments(guideSlug)
    return comments.find(c => c.id === commentId)
  } catch (error) {
    console.error('Error getting comment:', error)
    return undefined
  }
}

export const updateComment = async (guideSlug: string, commentId: string, updates: Partial<Comment>): Promise<boolean> => {
  try {
    const comments = await getAllComments(guideSlug)
    const commentIndex = comments.findIndex(c => c.id === commentId)
    
    if (commentIndex === -1) return false
    
    comments[commentIndex] = {
      ...comments[commentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await redis.set(COMMENTS_KEY(guideSlug), comments)
    return true
  } catch (error) {
    console.error('Error updating comment:', error)
    return false
  }
}

export const deleteComment = async (guideSlug: string, commentId: string): Promise<boolean> => {
  try {
    const comments = await getAllComments(guideSlug)
    const filteredComments = comments.filter(c => c.id !== commentId && c.parentId !== commentId)
    
    await redis.set(COMMENTS_KEY(guideSlug), filteredComments)
    return true
  } catch (error) {
    console.error('Error deleting comment:', error)
    return false
  }
}

// Rating-Funktionen
export const getRating = async (guideSlug: string): Promise<GuideRating> => {
  try {
    if (!guideSlug) {
      throw new Error('Guide slug is required')
    }
    
    const rating = await redis.get<GuideRating>(RATING_KEY(guideSlug))
    
    if (!rating) {
      // Erstelle ein neues Rating-Objekt
      const newRating: GuideRating = {
        guideSlug,
        totalLikes: 0,
        totalDislikes: 0,
        userReactions: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      await redis.set(RATING_KEY(guideSlug), newRating)
      return newRating
    }
    
    // Stelle sicher, dass alle erforderlichen Eigenschaften vorhanden sind
    return {
      guideSlug: rating.guideSlug || guideSlug,
      totalLikes: rating.totalLikes || 0,
      totalDislikes: rating.totalDislikes || 0,
      userReactions: rating.userReactions || {},
      createdAt: rating.createdAt || new Date().toISOString(),
      updatedAt: rating.updatedAt || new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting rating:', error)
    return {
      guideSlug,
      totalLikes: 0,
      totalDislikes: 0,
      userReactions: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

export const updateRating = async (guideSlug: string, updates: Partial<GuideRating>): Promise<void> => {
  try {
    const currentRating = await getRating(guideSlug)
    
    const updatedRating = {
      ...currentRating,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await redis.set(RATING_KEY(guideSlug), updatedRating)
  } catch (error) {
    console.error('Error updating rating:', error)
    throw error
  }
}

// Hilfsfunktion für bessere Session-IDs
export const generateSessionId = (request: Request): string => {
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Erstelle eine einfache Hash-basierte Session-ID
  const sessionData = `${ip}-${userAgent}`
  let hash = 0
  for (let i = 0; i < sessionData.length; i++) {
    const char = sessionData.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  
  return `session_${Math.abs(hash)}`
}