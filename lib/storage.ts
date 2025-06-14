// In-Memory Storage für Demo-Zwecke
// In Produktion würde man eine echte Datenbank verwenden

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
  parentId?: string // Für Antworten auf andere Kommentare
  replies?: Comment[] // Verschachtelte Antworten
  replyCount: number // Anzahl der Antworten
}

export interface GuideRating {
  guideSlug: string
  totalLikes: number
  totalDislikes: number
  userReactions: { [userId: string]: 'like' | 'dislike' }
  createdAt: string
  updatedAt: string
}

// Globale Storage-Objekte
export const commentsStorage: { [guideSlug: string]: Comment[] } = {}
export const ratingsStorage: { [guideSlug: string]: GuideRating } = {}

// Hilfsfunktionen
export const getComments = (guideSlug: string): Comment[] => {
  try {
    if (!guideSlug) return []
    
    const allComments = commentsStorage[guideSlug] || []
    
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

export const addComment = (guideSlug: string, comment: Comment): void => {
  if (!commentsStorage[guideSlug]) {
    commentsStorage[guideSlug] = []
  }
  commentsStorage[guideSlug].push(comment)
}

export const getComment = (guideSlug: string, commentId: string): Comment | undefined => {
  const comments = commentsStorage[guideSlug] || []
  return comments.find(c => c.id === commentId)
}

export const getAllComments = (guideSlug: string): Comment[] => {
  return commentsStorage[guideSlug] || []
}

export const updateComment = (guideSlug: string, commentId: string, updates: Partial<Comment>): boolean => {
  const comments = commentsStorage[guideSlug] || []
  const commentIndex = comments.findIndex(c => c.id === commentId)
  
  if (commentIndex === -1) return false
  
  commentsStorage[guideSlug][commentIndex] = {
    ...commentsStorage[guideSlug][commentIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  
  return true
}

export const getRating = (guideSlug: string): GuideRating => {
  try {
    if (!guideSlug) {
      throw new Error('Guide slug is required')
    }
    
    const rating = ratingsStorage[guideSlug]
    
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
      ratingsStorage[guideSlug] = newRating
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

export const updateRating = (guideSlug: string, updates: Partial<GuideRating>): void => {
  if (!ratingsStorage[guideSlug]) {
    ratingsStorage[guideSlug] = getRating(guideSlug)
  }
  
  ratingsStorage[guideSlug] = {
    ...ratingsStorage[guideSlug],
    ...updates,
    updatedAt: new Date().toISOString()
  }
}